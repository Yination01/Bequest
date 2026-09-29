#!/usr/bin/env python3
"""Threaded static server for the Bequest PWA.

Python's stock http.server is single-threaded: one slow/keep-alive connection
blocks every other request, which is what makes it hang behind a preview proxy
on mobile. This serves each request on its own thread, disables caching so you
always get the newest build, and sets the headers a PWA needs.
"""
import functools, hashlib, json, os, re, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DIR = os.path.dirname(os.path.abspath(__file__))
CLOUD_DIR = os.path.join(DIR, ".cloud")
os.makedirs(CLOUD_DIR, exist_ok=True)
MAX_SAVE = 2 * 1024 * 1024


def cloud_path(code):
    """Hash the sync code so it is never stored or logged in the clear."""
    h = hashlib.sha256(code.encode("utf-8")).hexdigest()[:40]
    return os.path.join(CLOUD_DIR, h + ".json")

class H(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _code(self):
        m = re.match(r"^/cloud/([^/?#]{1,120})$", self.path)
        return m.group(1) if m else None

    def do_PUT(self):
        code = self._code()
        if not code:
            return self._json(404, {"error": "not found"})
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0 or n > MAX_SAVE:
            return self._json(413, {"error": "bad size"})
        raw = self.rfile.read(n)
        try:
            json.loads(raw)
        except Exception:
            return self._json(400, {"error": "not json"})
        with open(cloud_path(code), "wb") as f:
            f.write(raw)
        self._json(200, {"ok": True, "bytes": n})

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET,PUT,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def send_head(self):
        """Serve directory indexes directly instead of 301-ing to add a slash.
        Behind a preview proxy that rewrites paths, those redirects can loop."""
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            for idx in ("index.html", "index.htm"):
                cand = os.path.join(path, idx)
                if os.path.exists(cand):
                    self.path = self.path.rstrip("/") + "/" + idx
                    break
        return super().send_head()

    def do_GET(self):
        code = self._code()
        if code:
            p = cloud_path(code)
            if not os.path.exists(p):
                return self._json(404, {"error": "no save"})
            with open(p, "rb") as f:
                body = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Service-Worker-Allowed", "/")
        # allow the preview iframe to embed us
        self.send_header("X-Frame-Options", "ALLOWALL")
        super().end_headers()

    def guess_type(self, path):
        if path.endswith(".webmanifest"):
            return "application/manifest+json"
        if path.endswith(".js"):
            return "text/javascript"
        return super().guess_type(path)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    handler = functools.partial(H, directory=DIR)
    srv = ThreadingHTTPServer(("0.0.0.0", port), handler)
    srv.daemon_threads = True
    print("Bequest serving %s on 0.0.0.0:%d" % (DIR, port), flush=True)
    srv.serve_forever()
