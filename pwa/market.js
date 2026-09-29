/* BEQUEST — the marketplace.
   Not a catalogue of types, but a board of individual things that are for
   sale this year: a specific car with a specific mileage, a specific flat
   on a specific street, at a price you can argue about.                    */

const STREETS = ['Alder','Bellfield','Carrow','Dunmore','Eastgate','Fenwick','Granby','Hollis',
  'Ilex','Jesmond','Kilburn','Lowther','Marchmont','Netherby','Oakfield','Prospect','Quarry',
  'Ravensworth','Sandhill','Thorne','Ullswater','Vernon','Westcote','Yarrow'];
const STREET_KIND = ['Road','Street','Lane','Avenue','Terrace','Close','Gardens','Crescent','Hill','Walk'];

const COLOURS = ['black','white','silver','dark blue','red','grey','green','beige','gunmetal'];

const SELLERS = [
  { id:'dealer',  n:'Dealer',        markup:1.12, haggle:0.55, warranty:true,
    d:'Forecourt price, but it comes with a warranty.' },
  { id:'private', n:'Private seller',markup:0.92, haggle:0.80, warranty:false,
    d:'Cheaper, sold as seen.' },
  { id:'auction', n:'Auction',       markup:0.78, haggle:0.25, warranty:false,
    d:'Cheap, and you are buying blind.' },
  { id:'estate',  n:'Estate agent',  markup:1.06, haggle:0.60, warranty:false,
    d:'Everything goes through them.' },
  { id:'owner',   n:'Owner',         markup:0.95, haggle:0.75, warranty:false,
    d:'Dealing direct.' },
  { id:'shop',    n:'Shop',          markup:1.00, haggle:0.20, warranty:true,
    d:'Fixed price, boxed, receipt.' },
  { id:'secondhand',n:'Secondhand',  markup:0.62, haggle:0.70, warranty:false,
    d:'Used, and priced like it.' }
];
const SELLER = id => SELLERS.find(s => s.id === id) || SELLERS[0];

/* Reasons a seller might take less than they are asking. */
const MOTIVES = [
  { id:'none',    n:'',                              give:0.00, w:40 },
  { id:'moving',  n:'They are moving abroad',        give:0.10, w:12 },
  { id:'quick',   n:'They want a quick sale',        give:0.12, w:14 },
  { id:'divorce', n:'A separation, by the sound of it', give:0.14, w:8 },
  { id:'upgrade', n:'They have already bought another', give:0.09, w:12 },
  { id:'probate', n:'Sold on behalf of an estate',   give:0.13, w:7 },
  { id:'firm',    n:'They will not be moved on price', give:-0.05, w:7 }
];

/* ---------------- generation ---------------- */
function mkId(){ return 'L'+Math.floor(Math.random()*1e9).toString(36); }

function pickMotive(rnd){
  const tot = MOTIVES.reduce((n,m)=>n+m.w,0);
  let r = rnd()*tot;
  for(const m of MOTIVES){ r-=m.w; if(r<=0) return m; }
  return MOTIVES[0];
}

function makeVehicleListing(def, rnd, ri2, col){
  const sellerId = rnd()<0.42?'dealer' : rnd()<0.7?'private':'auction';
  const seller = SELLER(sellerId);
  const age = def.id==='classic' ? ri2(18,45) : ri2(0,14);
  const miles = Math.round((age*ri2(5,14) + ri2(0,9)) * 1000);
  const cond = clampNum(100 - age*4 - miles/4000 + ri2(-8,14), 12, 100);
  const wear = 0.45 + (cond/100)*0.55;
  const price = Math.max(300, Math.round(def.base * col * wear * seller.markup * (0.92+rnd()*0.18)));
  return { id:mkId(), kind:'vehicle', t:def.id, price, ask:price, cond,
    age, miles, colour: COLOURS[Math.floor(rnd()*COLOURS.length)],
    seller: sellerId, motive: pickMotive(rnd).id, warranty: seller.warranty && cond>60 };
}

function makePropertyListing(def, rnd, ri2, col){
  const sellerId = rnd()<0.6?'estate':'owner';
  const seller = SELLER(sellerId);
  const cond = clampNum(ri2(25,98), 15, 100);
  const needsWork = cond < 45;
  const wear = 0.72 + (cond/100)*0.38;
  const price = Math.max(5000, Math.round(def.base * col * wear * seller.markup * (0.9+rnd()*0.22)));
  const addr = `${ri2(1,180)} ${STREETS[Math.floor(rnd()*STREETS.length)]} ${STREET_KIND[Math.floor(rnd()*STREET_KIND.length)]}`;
  return { id:mkId(), kind:'property', t:def.id, price, ask:price, cond, addr,
    seller: sellerId, motive: pickMotive(rnd).id, needsWork,
    tenant: def.commercial ? (rnd()<0.5) : false };
}

function makeItemListing(def, rnd, ri2, col){
  const used = rnd()<0.42 && def.cat!=='Assets';
  const sellerId = used ? 'secondhand' : 'shop';
  const seller = SELLER(sellerId);
  const cond = used ? clampNum(ri2(35,92),20,100) : 100;
  const wear = used ? 0.45+(cond/100)*0.5 : 1;
  const price = Math.max(5, Math.round(def.c * col * wear * seller.markup * (0.95+rnd()*0.12)));
  return { id:mkId(), kind:'item', t:def.id, price, ask:price, cond, used,
    seller: sellerId, motive: pickMotive(rnd).id };
}

function clampNum(v,a,b){ return Math.max(a, Math.min(b, Math.round(v))); }

/* How a seller responds to an offer.
   pct is how far below asking you are offering, 0..1                       */
function haggleOutcome(listing, offer, charisma, businessSkill, rnd){
  const seller = SELLER(listing.seller);
  const motive = MOTIVES.find(m=>m.id===listing.motive) || MOTIVES[0];
  const below = 1 - (offer / listing.ask);
  if (below <= 0) return { result:'accept', price: offer };
  /* what they would tolerate before walking */
  const tolerance = seller.haggle*0.22 + motive.give + charisma/650 + businessSkill/900;
  if (below <= tolerance*0.55) return { result:'accept', price: offer };
  if (below <= tolerance) {
    const meet = Math.round(listing.ask * (1 - below*0.55));
    return { result:'counter', price: meet };
  }
  if (below > tolerance*2.2 && rnd() < 0.45) return { result:'insulted', price: listing.ask };
  return { result:'refuse', price: listing.ask };
}
