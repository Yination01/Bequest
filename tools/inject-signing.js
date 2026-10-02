#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const bgPath = path.join(process.cwd(), 'android', 'app', 'build.gradle');
if (!fs.existsSync(bgPath)) {
  console.error('build.gradle not found at ' + bgPath);
  process.exit(1);
}

let bg = fs.readFileSync(bgPath, 'utf8');
const signingBlock = `
    signingConfigs {
        debug {
            storeFile file("debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }
`;

if (!bg.includes('signingConfigs {')) {
  bg = bg.replace(/buildTypes\s*\{/, signingBlock + '\n    buildTypes {');
  bg = bg.replace(/buildTypes\s*\{\s*release/, 'buildTypes {\n        debug {\n            signingConfig signingConfigs.debug\n        }\n        release');
  fs.writeFileSync(bgPath, bg);
  console.log('Successfully configured signingConfigs.debug in ' + bgPath);
} else {
  console.log('signingConfigs already present in ' + bgPath);
}
