/* BEQUEST — content data. Pure data, no logic. */
const DATA = {};

/* ---------------- COUNTRIES (30) ----------------
   sal = salary scale, col = cost of living, med = medical cost, crime = crime risk,
   edu = tuition scale, life = life-expectancy modifier, reg = name region          */
DATA.countries = [
  { id:'us', name:'United States',  sal:1.00, col:1.00, med:1.60, crime:1.0, edu:1.50, life:0,  reg:'west' },
  { id:'uk', name:'United Kingdom', sal:0.82, col:0.95, med:0.25, crime:0.8, edu:0.90, life:2,  reg:'west' },
  { id:'ca', name:'Canada',         sal:0.85, col:0.90, med:0.20, crime:0.7, edu:0.80, life:3,  reg:'west' },
  { id:'au', name:'Australia',      sal:0.92, col:1.05, med:0.25, crime:0.7, edu:0.95, life:3,  reg:'west' },
  { id:'nz', name:'New Zealand',    sal:0.78, col:0.95, med:0.22, crime:0.6, edu:0.75, life:3,  reg:'west' },
  { id:'ie', name:'Ireland',        sal:0.88, col:0.98, med:0.35, crime:0.6, edu:0.55, life:2,  reg:'west' },
  { id:'de', name:'Germany',        sal:0.88, col:0.88, med:0.20, crime:0.6, edu:0.10, life:2,  reg:'euro' },
  { id:'fr', name:'France',         sal:0.80, col:0.88, med:0.18, crime:0.8, edu:0.15, life:3,  reg:'euro' },
  { id:'es', name:'Spain',          sal:0.62, col:0.70, med:0.18, crime:0.7, edu:0.25, life:4,  reg:'euro' },
  { id:'it', name:'Italy',          sal:0.64, col:0.74, med:0.20, crime:0.9, edu:0.25, life:4,  reg:'euro' },
  { id:'nl', name:'Netherlands',    sal:0.90, col:0.95, med:0.30, crime:0.5, edu:0.30, life:3,  reg:'euro' },
  { id:'se', name:'Sweden',         sal:0.86, col:0.92, med:0.12, crime:0.6, edu:0.05, life:3,  reg:'nordic' },
  { id:'no', name:'Norway',         sal:1.05, col:1.20, med:0.12, crime:0.4, edu:0.05, life:3,  reg:'nordic' },
  { id:'pl', name:'Poland',         sal:0.42, col:0.48, med:0.20, crime:0.6, edu:0.20, life:0,  reg:'slav' },
  { id:'ru', name:'Russia',         sal:0.35, col:0.42, med:0.25, crime:1.3, edu:0.25, life:-6, reg:'slav' },
  { id:'ua', name:'Ukraine',        sal:0.22, col:0.32, med:0.28, crime:1.2, edu:0.20, life:-4, reg:'slav' },
  { id:'jp', name:'Japan',          sal:0.75, col:0.92, med:0.30, crime:0.3, edu:0.85, life:6,  reg:'jp' },
  { id:'kr', name:'South Korea',    sal:0.72, col:0.85, med:0.35, crime:0.4, edu:0.90, life:5,  reg:'kr' },
  { id:'cn', name:'China',          sal:0.40, col:0.50, med:0.45, crime:0.5, edu:0.40, life:1,  reg:'cn' },
  { id:'in', name:'India',          sal:0.22, col:0.30, med:0.30, crime:1.1, edu:0.35, life:-6, reg:'in' },
  { id:'ph', name:'Philippines',    sal:0.20, col:0.30, med:0.35, crime:1.2, edu:0.30, life:-4, reg:'ph' },
  { id:'id', name:'Indonesia',      sal:0.21, col:0.30, med:0.30, crime:1.0, edu:0.28, life:-4, reg:'id' },
  { id:'br', name:'Brazil',         sal:0.35, col:0.45, med:0.35, crime:1.6, edu:0.45, life:-2, reg:'latin' },
  { id:'mx', name:'Mexico',         sal:0.30, col:0.40, med:0.35, crime:1.7, edu:0.40, life:-2, reg:'latin' },
  { id:'ar', name:'Argentina',      sal:0.28, col:0.38, med:0.25, crime:1.3, edu:0.10, life:0,  reg:'latin' },
  { id:'ng', name:'Nigeria',        sal:0.14, col:0.24, med:0.55, crime:1.8, edu:0.35, life:-14,reg:'wafr' },
  { id:'gh', name:'Ghana',          sal:0.15, col:0.25, med:0.50, crime:1.2, edu:0.32, life:-12,reg:'wafr' },
  { id:'ke', name:'Kenya',          sal:0.16, col:0.26, med:0.50, crime:1.4, edu:0.35, life:-11,reg:'eafr' },
  { id:'za', name:'South Africa',   sal:0.38, col:0.44, med:0.45, crime:2.0, edu:0.45, life:-12,reg:'safr' },
  { id:'eg', name:'Egypt',          sal:0.18, col:0.26, med:0.35, crime:1.1, edu:0.25, life:-6, reg:'arab' },
  { id:'ae', name:'UAE',            sal:0.95, col:0.95, med:0.60, crime:0.3, edu:1.10, life:1,  reg:'arab' },
  { id:'tr', name:'Turkey',         sal:0.30, col:0.40, med:0.28, crime:0.9, edu:0.30, life:0,  reg:'tr' }
];

/* ---------------- NAMES BY REGION ---------------- */
DATA.names = {
  west:  { m:['James','Daniel','Owen','Theo','Samuel','Noah','Elliot','Caleb','Miles','Jonah','Nathan','Cole','Reid','Finn','Grant'],
           f:['Ava','Clara','Ruth','Iris','Nora','June','Heidi','Zoe','Cora','Edith','Paige','Tessa','Wren','Maeve','Sloane'],
           l:['Brennan','Whitlock','Dunne','Hollis','Ashford','Marsden','Kerrigan','Vaughn','Radcliffe','Thorne','Bishop','Halloway','Crane','Sutton','Pike'] },
  euro:  { m:['Hugo','Felix','Matthias','Lucien','Bastien','Emil','Rafael','Nico','Anton','Dario'],
           f:['Elena','Marta','Alma','Lena','Giulia','Camille','Sofie','Ines','Nadja','Clara'],
           l:['Fischer','Laurent','Moreau','Bianchi','Dubois','Keller','Romano','Vermeulen','Bauer','Lefevre','Conti','Weiss'] },
  nordic:{ m:['Lars','Odin','Erik','Magnus','Sven','Bjorn','Kasper'],
           f:['Astrid','Freja','Ingrid','Sigrid','Liv','Marit'],
           l:['Lindqvist','Bergstrom','Haugen','Dahl','Nyberg','Solberg','Aalto'] },
  slav:  { m:['Ivan','Roman','Pavel','Milos','Dmitri','Tomasz','Bohdan'],
           f:['Vera','Katya','Zofia','Milena','Irina','Oksana'],
           l:['Kovacs','Novak','Petrov','Wojcik','Marek','Sokolov','Bondar'] },
  jp:    { m:['Haruki','Ren','Kaito','Sora','Yuto','Takumi'],
           f:['Yui','Aoi','Hana','Rin','Mio','Sakura'],
           l:['Nakamura','Fujimoto','Ishikawa','Takahashi','Morita','Sasaki'] },
  kr:    { m:['Minjun','Jihoon','Seojun','Hyunwoo','Daeun'],
           f:['Seoyeon','Jiwoo','Hayoon','Eunji','Yuna'],
           l:['Park','Kim','Choi','Jung','Yoon','Kang'] },
  cn:    { m:['Wei','Hao','Jian','Ming','Feng','Lei'],
           f:['Mei','Lin','Xia','Yun','Jing','Fang'],
           l:['Chen','Zhang','Liu','Huang','Zhao','Wu'] },
  in:    { m:['Arjun','Rohan','Vikram','Aditya','Rahul','Karan'],
           f:['Priya','Anaya','Meera','Divya','Ishita','Kavya'],
           l:['Kaur','Sharma','Patel','Reddy','Nair','Iyer','Chopra'] },
  ph:    { m:['Miguel','Jose','Andres','Paolo','Rico'],
           f:['Maria','Angel','Liza','Carmela','Divina'],
           l:['Santos','Reyes','Cruz','Bautista','Delgado'] },
  id:    { m:['Budi','Agus','Rizki','Dimas','Bayu'],
           f:['Siti','Dewi','Putri','Ayu','Indah'],
           l:['Wijaya','Santoso','Pratama','Halim','Nugroho'] },
  latin: { m:['Andre','Victor','Mateo','Diego','Tomas','Rafael'],
           f:['Sofia','Rosa','Valentina','Camila','Lucia','Elena'],
           l:['Vasquez','Duarte','Reyes','Sandoval','Castillo','Moreira','Herrera'] },
  wafr:  { m:['Chidi','Emeka','Kwame','Tunde','Obinna','Kofi','Femi'],
           f:['Amara','Ngozi','Abena','Folake','Chioma','Ama','Yewande'],
           l:['Okafor','Mensah','Okonkwo','Adeyemi','Boateng','Eze','Balogun','Owusu'] },
  eafr:  { m:['Juma','Baraka','Otieno','Kamau','Musa'],
           f:['Wanjiru','Amani','Zuri','Neema','Halima'],
           l:['Kariuki','Mwangi','Odhiambo','Njoroge','Wekesa'] },
  safr:  { m:['Sipho','Thabo','Lwazi','Bongani','Pieter'],
           f:['Nandi','Lerato','Zanele','Thandi','Anika'],
           l:['Dlamini','Nkosi','Mokoena','Botha','Zulu','Van Wyk'] },
  arab:  { m:['Omar','Yusuf','Karim','Tariq','Hassan','Ali'],
           f:['Layla','Amina','Nour','Salma','Rania','Zahra'],
           l:['Haddad','Mansour','Khalil','Nasser','Farouk','Rashid'] },
  tr:    { m:['Emre','Mehmet','Kerem','Burak','Deniz'],
           f:['Elif','Zeynep','Defne','Ceren','Esra'],
           l:['Yilmaz','Demir','Kaya','Sahin','Ozturk'] }
};

DATA.cities = {
  west:['Riverton','Ashford','Kingsport','Bramley','Northgate','Redhill','Fairview','Elmwood','Carrow','Stonebridge'],
  euro:['Lindenberg','Valmont','Castellina','Rijkhof','Aubevoir','Brenner'],
  nordic:['Vikhamn','Norrsund','Fjellby','Halmstrand'],
  slav:['Zelenograd','Novemesto','Bilhorod','Krasnik'],
  jp:['Hinode','Shirakawa','Minamino'], kr:['Haeun','Sangju','Namgu'], cn:['Jinhe','Nanping','Wuxing'],
  in:['Rampur','Devgarh','Chandpur','Saraswati'], ph:['San Roque','Lipa Norte','Malaya'],
  id:['Batukota','Sindang','Mekarsari'],
  latin:['Santa Lucia','Puerto Verde','Villa Nueva','Monteclaro'],
  wafr:['Ikeja','Ajegunle','Takoradi','Enugu North','Osu','Warri'],
  eafr:['Kisumu West','Mwanza','Nakuru East'], safr:['Soweto East','Bloemhof','Kwazi'],
  arab:['Al Hidd','Madinat Zayed','Shubra'], tr:['Karabel','Yesilkoy','Altinova']
};

DATA.orgPrefix = ['Northgate','Meridian','Summit','Apex','Crescent','Ironbridge','Blue Harbour','Vantage','Keystone','Lantern'];
DATA.orgSuffix = {
  corp:['Group','Holdings','Partners','Consulting','Industries','Corporation','Associates'],
  tech:['Systems','Labs','Technologies','Digital','Software','Data'],
  service:['Kitchen','Restaurant Group','Hospitality','Catering','Bistro'],
  trade:['Construction','Contracting','Builders','Engineering','Works'],
  medical:['Medical Centre','Hospital Trust','Clinic','Health Group'],
  public:['School Trust','Council','Authority','Public Service','Institute'],
  security:['Security','Protective Services','Division','Force'],
  sport:['Athletic Club','Sports Club','FC','Academy'],
  writing:['Press','Publishing','Media','Review','Journal'],
  music:['Records','Sound','Music Group','Studios'],
  art:['Gallery','Studio','Atelier','Arts Collective'],
  gaming:['Esports','Gaming','Interactive','Team'],
  politics:['Party Office','Assembly','Council','Chamber']
};

/* ---------------- ORIENTATION ---------------- */
DATA.orientations = [
  { id:'straight', n:'Straight',  w:78, attracted:'opposite' },
  { id:'gay',      n:'Gay',       w:6,  attracted:'same' },
  { id:'lesbian',  n:'Lesbian',   w:0,  attracted:'same' },
  { id:'bi',       n:'Bisexual',  w:13, attracted:'any' },
  { id:'ace',      n:'Asexual',   w:3,  attracted:'none' }
];

/* ---------------- PETS ---------------- */
DATA.petSpecies = [
  { id:'dog',    n:'Dog',      life:[10,16], cost:900,  happy:5, health:2, adopt:200,  walk:true },
  { id:'cat',    n:'Cat',      life:[12,20], cost:600,  happy:4, health:1, adopt:120 },
  { id:'rabbit', n:'Rabbit',   life:[6,11],  cost:350,  happy:3, health:0, adopt:60 },
  { id:'hamster',n:'Hamster',  life:[2,4],   cost:120,  happy:2, health:0, adopt:20 },
  { id:'parrot', n:'Parrot',   life:[25,60], cost:700,  happy:4, health:0, adopt:300 },
  { id:'fish',   n:'Fish',     life:[2,8],   cost:90,   happy:1, health:0, adopt:15 },
  { id:'horse',  n:'Horse',    life:[20,33], cost:9000, happy:8, health:4, adopt:3000 },
  { id:'snake',  n:'Snake',    life:[10,25], cost:400,  happy:2, health:0, adopt:150 },
  { id:'tortoise',n:'Tortoise',life:[40,90], cost:200,  happy:2, health:0, adopt:180 }
];
DATA.petNames = ['Bandit','Pepper','Luna','Scout','Biscuit','Nero','Maple','Juno','Ziggy','Olive',
  'Rusty','Poppy','Tank','Hazel','Mango','Bruno','Willow','Pickle','Smokey','Nutmeg','Django','Fern'];

DATA.statKeys  = ['health','happiness','smarts','looks','reputation','discipline'];
DATA.statNames = { health:'Health', happiness:'Happiness', smarts:'Smarts', looks:'Looks', reputation:'Reputation', discipline:'Discipline' };
DATA.statIcons = { health:'♥', happiness:'☺', smarts:'✦', looks:'◈', reputation:'★', discipline:'▲' };

/* ---------------- TRAITS (20) ---------------- */
DATA.traits = [
  { id:'gifted',    name:'Gifted',        desc:'Smarts grows faster.' },
  { id:'athletic',  name:'Athletic',      desc:'Fitness and Health grow faster.' },
  { id:'charming',  name:'Charming',      desc:'Social rolls are easier.' },
  { id:'anxious',   name:'Anxious',       desc:'Happiness decays faster.' },
  { id:'stubborn',  name:'Stubborn',      desc:'High discipline, harder relationships.' },
  { id:'frail',     name:'Frail',         desc:'Health decays faster.' },
  { id:'lucky',     name:'Lucky',         desc:'Risky rolls tilt your way.' },
  { id:'addictive', name:'Addictive',     desc:'Habits grip you faster.' },
  { id:'ambitious', name:'Ambitious',     desc:'Promotions come easier.' },
  { id:'kind',      name:'Kind',          desc:'Relationships decay slower.' },
  { id:'beautiful', name:'Beautiful',     desc:'Born with exceptional looks.' },
  { id:'sickly',    name:'Sickly',        desc:'Prone to illness throughout life.' },
  { id:'ironwill',  name:'Iron Will',     desc:'Far better at quitting habits.' },
  { id:'reckless',  name:'Reckless',      desc:'Bigger wins, bigger disasters.' },
  { id:'shrewd',    name:'Shrewd',        desc:'Better investment returns.' },
  { id:'loner',     name:'Loner',         desc:'Fewer friends, more discipline.' },
  { id:'funny',     name:'Funny',         desc:'People forgive you more.' },
  { id:'hottemper', name:'Hot-Tempered',  desc:'Fights go better, relationships worse.' },
  { id:'nightowl',  name:'Night Owl',     desc:'Poor sleep, creative bursts.' },
  { id:'oldsoul',   name:'Old Soul',      desc:'Ages slowly, starts wiser.' },
  /* only obtainable by discovery */
  { id:'marked',    name:'Marked',        desc:'Rare things happen to you more often.', secret:true },
  { id:'inherited', name:'Inherited',     desc:'You begin knowing how it ends.', secret:true }
];

DATA.wealthTiers = [
  { id:0, name:'Poverty',       w:18, money:[0,800],          mult:0.55 },
  { id:1, name:'Working class', w:34, money:[1000,9000],      mult:0.85 },
  { id:2, name:'Middle class',  w:32, money:[9000,60000],     mult:1.00 },
  { id:3, name:'Affluent',      w:13, money:[60000,400000],   mult:1.25 },
  { id:4, name:'Wealthy',       w:3,  money:[400000,4000000], mult:1.60 }
];

/* ---------------- SKILLS (12) ---------------- */
DATA.skills = {
  cooking:  { name:'Cooking',   tiers:['Cook at home','Line cook job','Chef job','Restaurant owner'] },
  writing:  { name:'Writing',   tiers:['Start a blog','Freelance writing','Journalist','Novelist'] },
  gaming:   { name:'Gaming',    tiers:['Casual streams','Small streamer income','Esports tryout','Pro contract'] },
  handiness:{ name:'Handiness', tiers:['DIY repairs','Handyman gigs','Contractor','Construction firm'] },
  fitness:  { name:'Fitness',   tiers:['Slower health decay','Gym trainer job','Athlete tryout','Pro athlete'] },
  charisma: { name:'Charisma',  tiers:['Better social rolls','Sales jobs','Management track','Politics'] },
  business: { name:'Business',  tiers:['Understand investing','Manage a business','Multi-business','Empire'] },
  combat:   { name:'Combat',    tiers:['Win fights','Security job','Military advancement','Champion'] },
  music:    { name:'Music',     tiers:['Play for friends','Bar gigs','Session musician','Recording artist'] },
  art:      { name:'Art',       tiers:['Sketchbook','Sell prints','Gallery shows','Renowned artist'] },
  tech:     { name:'Tech',      tiers:['Fix your own PC','IT support','Software engineer','Chief architect'] },
  medicine: { name:'Medicine',  tiers:['First aid','Care assistant','Clinician','Surgeon'] }
};

/* ---------------- HABITS (10) ---------------- */
DATA.habits = {
  smoking:  { name:'Smoking',    cost:2400, good:false, eff:{health:-3,looks:-1} },
  drinking: { name:'Drinking',   cost:1800, good:false, eff:{health:-2,happiness:1} },
  junkfood: { name:'Junk food',  cost:1500, good:false, eff:{health:-2,looks:-2,happiness:1} },
  caffeine: { name:'Caffeine',   cost:900,  good:false, eff:{discipline:1,health:-1} },
  gambling: { name:'Gambling',   cost:0,    good:false, eff:{happiness:-1} },
  drugs:    { name:'Hard drugs', cost:6000, good:false, eff:{health:-6,looks:-3,reputation:-3,happiness:2} },
  doomscroll:{name:'Doomscrolling',cost:0,  good:false, eff:{happiness:-2,smarts:-1,discipline:-1} },
  gym:      { name:'Gym',        cost:600,  good:true,  eff:{health:3,looks:2} },
  sleep:    { name:'Good sleep', cost:0,    good:true,  eff:{health:2,smarts:1,discipline:1} },
  reading:  { name:'Reading',    cost:200,  good:true,  eff:{smarts:3,happiness:1} }
};

/* ---------------- JOB LADDER (70) ----------------
   edu: 0 none, 1 highschool, 2 trade/cert, 3 bachelors, 4 postgrad                */
DATA.jobs = [
  /* service */
  { id:'dishwasher', t:'Dishwasher',      pay:21000, edu:0, req:{},                        field:'service' },
  { id:'cashier',    t:'Cashier',         pay:24000, edu:0, req:{},                        field:'service' },
  { id:'barista',    t:'Barista',         pay:26000, edu:0, req:{charisma:10},             field:'service' },
  { id:'waiter',     t:'Server',          pay:28000, edu:0, req:{charisma:15},             field:'service' },
  { id:'linecook',   t:'Line Cook',       pay:33000, edu:0, req:{cooking:50},              field:'service' },
  { id:'souschef',   t:'Sous Chef',       pay:45000, edu:0, req:{cooking:62},              field:'service' },
  { id:'chef',       t:'Chef',            pay:58000, edu:2, req:{cooking:75},              field:'service' },
  { id:'headchef',   t:'Head Chef',       pay:92000, edu:2, req:{cooking:90,business:30},  field:'service' },
  { id:'restaurateur',t:'Restaurateur',   pay:150000,edu:2, req:{cooking:95,business:60},  field:'service' },
  /* trade */
  { id:'labourer',   t:'Labourer',        pay:30000, edu:0, req:{},                        field:'trade' },
  { id:'apprentice', t:'Apprentice',      pay:26000, edu:0, req:{handiness:20},            field:'trade' },
  { id:'handyman',   t:'Handyman',        pay:41000, edu:0, req:{handiness:50},            field:'trade' },
  { id:'plumber',    t:'Plumber',         pay:55000, edu:2, req:{handiness:58},            field:'trade' },
  { id:'electrician',t:'Electrician',     pay:62000, edu:2, req:{handiness:65},            field:'trade' },
  { id:'foreman',    t:'Site Foreman',    pay:82000, edu:2, req:{handiness:72,charisma:40},field:'trade' },
  { id:'contractor', t:'Contractor',      pay:105000,edu:2, req:{handiness:80,business:40},field:'trade' },
  { id:'developer_p',t:'Property Developer',pay:210000,edu:2,req:{handiness:85,business:75},field:'trade' },
  /* corporate */
  { id:'intern',     t:'Office Intern',   pay:26000, edu:1, req:{},                        field:'corp' },
  { id:'assistant',  t:'Admin Assistant', pay:38000, edu:1, req:{},                        field:'corp' },
  { id:'coordinator',t:'Coordinator',     pay:47000, edu:1, req:{charisma:30},             field:'corp' },
  { id:'analyst',    t:'Junior Analyst',  pay:57000, edu:3, req:{smarts:50},               field:'corp' },
  { id:'senior',     t:'Senior Analyst',  pay:84000, edu:3, req:{smarts:60,business:35},   field:'corp' },
  { id:'manager',    t:'Manager',         pay:118000,edu:3, req:{charisma:55,business:50}, field:'corp' },
  { id:'director',   t:'Director',        pay:180000,edu:3, req:{charisma:70,business:65}, field:'corp' },
  { id:'vp',         t:'Vice President',  pay:265000,edu:3, req:{charisma:80,business:78}, field:'corp' },
  { id:'ceo',        t:'CEO',             pay:420000,edu:3, req:{charisma:88,business:90,reputation:60}, field:'corp' },
  /* tech */
  { id:'ithelp',     t:'IT Support',      pay:38000, edu:1, req:{tech:25},                 field:'tech' },
  { id:'sysadmin',   t:'Sysadmin',        pay:62000, edu:2, req:{tech:45},                 field:'tech' },
  { id:'swe',        t:'Software Engineer',pay:98000,edu:3, req:{tech:60,smarts:55},       field:'tech' },
  { id:'seniorswe',  t:'Senior Engineer', pay:150000,edu:3, req:{tech:75,smarts:65},       field:'tech' },
  { id:'architect',  t:'Chief Architect', pay:230000,edu:3, req:{tech:88,smarts:75},       field:'tech' },
  { id:'cto',        t:'CTO',             pay:380000,edu:3, req:{tech:95,business:70},     field:'tech' },
  /* medical */
  { id:'careassist', t:'Care Assistant',  pay:28000, edu:0, req:{medicine:20},             field:'medical' },
  { id:'paramedic',  t:'Paramedic',       pay:48000, edu:2, req:{medicine:45},             field:'medical' },
  { id:'nurse',      t:'Nurse',           pay:64000, edu:3, req:{medicine:55,smarts:55},   field:'medical' },
  { id:'gp',         t:'General Practitioner',pay:150000,edu:4,req:{medicine:75,smarts:78},field:'medical' },
  { id:'surgeon',    t:'Surgeon',         pay:290000,edu:4, req:{medicine:92,smarts:85},   field:'medical' },
  /* public */
  { id:'teachassist',t:'Teaching Assistant',pay:29000,edu:1, req:{},                       field:'public' },
  { id:'teacher',    t:'Teacher',         pay:48000, edu:3, req:{smarts:55},               field:'public' },
  { id:'headteacher',t:'Head Teacher',    pay:95000, edu:3, req:{smarts:70,charisma:65},   field:'public' },
  { id:'clerk',      t:'Civil Servant',   pay:42000, edu:1, req:{},                        field:'public' },
  { id:'lawyer',     t:'Lawyer',          pay:145000,edu:4, req:{smarts:78,charisma:60},   field:'public' },
  { id:'judge',      t:'Judge',           pay:210000,edu:4, req:{smarts:88,reputation:70}, field:'public' },
  /* security */
  { id:'security',   t:'Security Guard',  pay:32000, edu:0, req:{combat:35},               field:'security' },
  { id:'soldier',    t:'Soldier',         pay:42000, edu:1, req:{combat:50,fitness:45},    field:'security' },
  { id:'police',     t:'Police Officer',  pay:55000, edu:1, req:{combat:55,reputation:40}, field:'security' },
  { id:'detective',  t:'Detective',       pay:80000, edu:1, req:{combat:60,smarts:60},     field:'security' },
  { id:'specialops', t:'Special Forces',  pay:130000,edu:1, req:{combat:88,fitness:85},    field:'security' },
  /* creative */
  { id:'trainer',    t:'Personal Trainer',pay:44000, edu:0, req:{fitness:50},              field:'sport' },
  { id:'semipro',    t:'Semi-Pro Athlete',pay:70000, edu:0, req:{fitness:72},              field:'sport' },
  { id:'athlete',    t:'Professional Athlete',pay:230000,edu:0,req:{fitness:90},           field:'sport' },
  { id:'sporticon',  t:'Sporting Icon',pay:600000,edu:0,req:{fitness:98,reputation:70},field:'sport' },
  { id:'blogger',    t:'Blogger',         pay:22000, edu:0, req:{writing:25},              field:'writing' },
  { id:'freelance',  t:'Freelance Writer',pay:36000, edu:0, req:{writing:50},              field:'writing' },
  { id:'journalist', t:'Journalist',      pay:61000, edu:3, req:{writing:70},              field:'writing' },
  { id:'editor',     t:'Editor',          pay:95000, edu:3, req:{writing:85,charisma:50},  field:'writing' },
  { id:'novelist',   t:'Novelist',        pay:140000,edu:0, req:{writing:95},              field:'writing' },
  { id:'busker',     t:'Busker',          pay:12000, edu:0, req:{music:20},                field:'music' },
  { id:'gigmusician',t:'Gigging Musician',pay:31000, edu:0, req:{music:45},                field:'music' },
  { id:'session',    t:'Session Musician',pay:58000, edu:0, req:{music:68},                field:'music' },
  { id:'recording',  t:'Recording Artist',pay:180000,edu:0, req:{music:88,reputation:55},  field:'music' },
  { id:'popstar',    t:'Pop Star',        pay:750000,edu:0, req:{music:97,reputation:80},  field:'music' },
  { id:'streetart',  t:'Street Artist',   pay:15000, edu:0, req:{art:25},                  field:'art' },
  { id:'illustrator',t:'Illustrator',     pay:44000, edu:0, req:{art:52},                  field:'art' },
  { id:'galleryart', t:'Gallery Artist',  pay:85000, edu:0, req:{art:75},                  field:'art' },
  { id:'masterart',  t:'Renowned Artist', pay:260000,edu:0, req:{art:93,reputation:60},    field:'art' },
  { id:'streamer',   t:'Streamer',        pay:30000, edu:0, req:{gaming:50},               field:'gaming' },
  { id:'progamer',   t:'Esports Pro',     pay:175000,edu:0, req:{gaming:88},               field:'gaming' },
  { id:'esportslegend',t:'Esports Legend',pay:420000,edu:0, req:{gaming:97,reputation:60}, field:'gaming' },
  /* politics */
  { id:'councillor', t:'Local Councillor',pay:38000, edu:1, req:{charisma:50,reputation:55},field:'politics' },
  { id:'mayor',      t:'Mayor',           pay:90000, edu:3, req:{charisma:68,reputation:68},field:'politics' },
  { id:'mp',         t:'Member of Parliament',pay:130000,edu:3,req:{charisma:78,reputation:75},field:'politics' },
  { id:'minister',   t:'Government Minister',pay:200000,edu:3,req:{charisma:88,reputation:85},field:'politics' }
];

DATA.eduNames = ['No qualifications','High school diploma','Trade certificate','Bachelor\u2019s degree','Postgraduate degree'];
DATA.fieldNames = { service:'Hospitality', trade:'Trades', corp:'Corporate', tech:'Technology', medical:'Medical',
  public:'Public sector', security:'Security & Forces', sport:'Sport', writing:'Writing', music:'Music', art:'Art',
  gaming:'Gaming', politics:'Politics' };

/* ---------------- SHOP ITEMS (58) ---------------- */
DATA.items = [
  { id:'phone',    n:'Smartphone',        c:900,   cat:'Tech', d:'+2 Charisma/yr · unlocks social media', eff:{charisma:2}, tag:'phone' },
  { id:'phone2',   n:'Flagship Phone',    c:1600,  cat:'Tech', d:'+3 Charisma, +2 Reputation /yr', eff:{charisma:3,reputation:2}, tag:'phone' },
  { id:'laptop',   n:'Laptop',            c:1400,  cat:'Tech', d:'+2 Smarts/yr · unlocks writing & streaming', eff:{smarts:2}, tag:'laptop' },
  { id:'gamingpc', n:'Gaming PC',         c:2600,  cat:'Tech', d:'+2 Gaming, +1 Tech /yr', skill:{gaming:2,tech:1} },
  { id:'console',  n:'Games Console',     c:600,   cat:'Tech', d:'+2 Happiness, +1 Gaming /yr', eff:{happiness:2}, skill:{gaming:1} },
  { id:'camera',   n:'Camera',            c:1100,  cat:'Tech', d:'+1 Art/yr · better content', skill:{art:1} },
  { id:'studio',   n:'Home Studio',       c:5200,  cat:'Tech', d:'+3 Music/yr', skill:{music:3} },
  { id:'tablet',   n:'Tablet',            c:700,   cat:'Tech', d:'+1 Smarts, +1 Art /yr', eff:{smarts:1}, skill:{art:1} },

  { id:'books',    n:'Bookshelf',         c:300,   cat:'Self', d:'+1 Smarts/yr', eff:{smarts:1} },
  { id:'course',   n:'Online Course',     c:800,   cat:'Self', d:'+8 Smarts once', once:{smarts:8} },
  { id:'language', n:'Language Course',   c:1200,  cat:'Self', d:'+6 Smarts, +5 Charisma once', once:{smarts:6,charisma:5} },
  { id:'cookset',  n:'Chef Knife Set',    c:450,   cat:'Self', d:'+1 Cooking/yr', skill:{cooking:1} },
  { id:'toolkit',  n:'Tool Kit',          c:380,   cat:'Self', d:'+1 Handiness/yr', skill:{handiness:1} },
  { id:'guitar',   n:'Guitar',            c:500,   cat:'Self', d:'+2 Music/yr', skill:{music:2} },
  { id:'paints',   n:'Paint Set',         c:220,   cat:'Self', d:'+2 Art/yr', skill:{art:2} },
  { id:'typewriter',n:'Writing Desk',     c:600,   cat:'Self', d:'+2 Writing/yr', skill:{writing:2} },
  { id:'gymkit',   n:'Home Gym',          c:1200,  cat:'Self', d:'+1 Health, +1 Fitness /yr', eff:{health:1}, skill:{fitness:1} },
  { id:'bike',     n:'Bicycle',           c:450,   cat:'Self', d:'+2 Health, +1 Fitness /yr', eff:{health:2}, skill:{fitness:1} },

  { id:'skincare', n:'Skincare Routine',  c:700,   cat:'Health', d:'+2 Looks/yr', eff:{looks:2} },
  { id:'dentist',  n:'Cosmetic Dentistry',c:3800,  cat:'Health', d:'+8 Looks once', once:{looks:8} },
  { id:'therapy',  n:'Therapy Package',   c:2600,  cat:'Health', d:'+12 Happiness once', once:{happiness:12} },
  { id:'meds',     n:'Medication',        c:1100,  cat:'Health', d:'+15 Health once', once:{health:15} },
  { id:'insurance',n:'Health Insurance',  c:3400,  cat:'Health', d:'Halves all medical bills', tag:'insurance' },
  { id:'lifeins',  n:'Life Insurance',    c:2200,  cat:'Health', d:'Pays your heirs on death', tag:'lifeins' },
  { id:'supplements',n:'Supplements',     c:600,   cat:'Health', d:'+1 Health, +1 Fitness /yr', eff:{health:1}, skill:{fitness:1} },
  { id:'checkup',  n:'Annual Screening',  c:1500,  cat:'Health', d:'Catches illness early', tag:'screening' },

  { id:'wardrobe', n:'Designer Wardrobe', c:4000,  cat:'Lifestyle', d:'+6 Looks once, +1/yr', eff:{looks:1}, once:{looks:6} },
  { id:'suit',     n:'Interview Suit',    c:600,   cat:'Lifestyle', d:'+10% job application success', tag:'suit' },
  { id:'watch',    n:'Luxury Watch',      c:12000, cat:'Lifestyle', d:'+4 Reputation once', once:{reputation:4} },
  { id:'jewellery',n:'Fine Jewellery',    c:8000,  cat:'Lifestyle', d:'+3 Looks, +2 Reputation /yr', eff:{looks:3,reputation:2} },
  { id:'ring',     n:'Engagement Ring',   c:5000,  cat:'Lifestyle', d:'Required to propose', tag:'ring' },
  { id:'ring2',    n:'Extravagant Ring',  c:25000, cat:'Lifestyle', d:'Proposal far more likely to succeed', tag:'ring' },
  { id:'vacation', n:'Holiday Package',   c:4500,  cat:'Lifestyle', d:'+20 Happiness once', once:{happiness:20} },
  { id:'worldtrip',n:'Round-the-World Trip',c:22000,cat:'Lifestyle',d:'+40 Happiness, +8 Smarts once', once:{happiness:40,smarts:8} },
  { id:'pet',      n:'Dog',               c:1200,  cat:'Lifestyle', d:'+4 Happiness/yr', eff:{happiness:4}, tag:'pet' },
  { id:'accountant',n:'Tax Accountant',   c:3000,  cat:'Lifestyle', d:'Cuts your tax rate', tag:'accountant' },
  { id:'lawyer_r', n:'Lawyer on Retainer',c:7000,  cat:'Lifestyle', d:'Reduces sentences dramatically', tag:'lawyer' },
  { id:'cleaner',  n:'Cleaner',           c:2400,  cat:'Lifestyle', d:'+3 Happiness, +1 Health /yr', eff:{happiness:3,health:1} },

  { id:'scooter',  n:'Scooter',           c:1800,  cat:'Vehicle', d:'+1 Happiness/yr', eff:{happiness:1}, tag:'car' },
  { id:'car1',     n:'Used Car',          c:6500,  cat:'Vehicle', d:'+2 Happiness/yr', eff:{happiness:2}, tag:'car' },
  { id:'car2',     n:'New Sedan',         c:32000, cat:'Vehicle', d:'+4 Happiness, +3 Reputation /yr', eff:{happiness:4,reputation:3}, tag:'car' },
  { id:'car3',     n:'Sports Car',        c:120000,cat:'Vehicle', d:'+6 Happiness, +8 Reputation, +3 Looks /yr', eff:{happiness:6,reputation:8,looks:3}, tag:'car' },
  { id:'car4',     n:'Supercar',          c:450000,cat:'Vehicle', d:'+10 Happiness, +15 Reputation /yr', eff:{happiness:10,reputation:15}, tag:'car' },
  { id:'boat',     n:'Yacht',             c:900000,cat:'Vehicle', d:'+14 Happiness, +20 Reputation /yr', eff:{happiness:14,reputation:20} },
  { id:'v8car',    n:'The V8',             c:9000,  cat:'Vehicle', d:'Unlocked. +8 Happiness, +6 Reputation /yr', eff:{happiness:8,reputation:6}, tag:'car', secret:true },
  { id:'jet',      n:'Private Jet',       c:4000000,cat:'Vehicle',d:'+20 Happiness, +30 Reputation /yr', eff:{happiness:20,reputation:30} },

  { id:'lockpick', n:'Lock Picks',        c:250,   cat:'Black market', d:'+15% burglary success', tag:'lockpick' },
  { id:'fakeid',   n:'Fake ID',           c:400,   cat:'Black market', d:'Can beat an arrest', tag:'fakeid' },
  { id:'burner',   n:'Burner Phone',      c:180,   cat:'Black market', d:'\u221215% arrest chance', tag:'burner' },
  { id:'pistol',   n:'Handgun',           c:800,   cat:'Black market', d:'Better heist odds, worse sentences', tag:'gun' },
  { id:'balaclava',n:'Balaclava',         c:60,    cat:'Black market', d:'\u221210% arrest chance', tag:'mask' },
  { id:'hacking',  n:'Hacking Toolkit',   c:3200,  cat:'Black market', d:'+20% fraud success', tag:'hacktool' },
  { id:'getaway',  n:'Getaway Driver',    c:5500,  cat:'Black market', d:'+20% escape on any crime', tag:'getaway' },
  { id:'contraband',n:'Contraband Stash', c:2000,  cat:'Black market', d:'Sell later for profit or prison', tag:'stash' },

  { id:'plot',     n:'Plot of Land',      c:35000, cat:'Assets', d:'Appreciates quietly', tag:'land' },
  { id:'shopunit', n:'Retail Unit',       c:120000,cat:'Assets', d:'Rental income each year', tag:'commercial' },
  { id:'art_inv',  n:'Investment Artwork',c:60000, cat:'Assets', d:'Volatile but can soar', tag:'artinv' },
  { id:'gold',     n:'Gold Bullion',      c:20000, cat:'Assets', d:'Safe store of value', tag:'gold' },
  { id:'vineyard', n:'Small Vineyard',    c:400000,cat:'Assets', d:'Prestige and income', tag:'vineyard' }
];

/* ---------------- CRIMES (14) ---------------- */
DATA.crimes = [
  { id:'pickpocket', n:'Pickpocket',       base:0.62, take:[40,400],        skill:'charisma', sentence:[0,1],  minAge:10 },
  { id:'shoplift',   n:'Shoplift',         base:0.68, take:[30,700],        skill:'charisma', sentence:[0,1],  minAge:10 },
  { id:'vandalism',  n:'Vandalism',        base:0.72, take:[0,0],           skill:'combat',   sentence:[0,1],  minAge:10 },
  { id:'bikesteal',  n:'Steal a Bike',     base:0.66, take:[100,900],       skill:'handiness',sentence:[0,1],  minAge:12 },
  { id:'burglary',   n:'Burglary',         base:0.45, take:[800,9000],      skill:'handiness',sentence:[1,4],  minAge:16 },
  { id:'mugging',    n:'Mugging',          base:0.48, take:[100,2500],      skill:'combat',   sentence:[2,6],  minAge:16 },
  { id:'gta',        n:'Grand Theft Auto', base:0.38, take:[3000,40000],    skill:'handiness',sentence:[2,6],  minAge:16 },
  { id:'drugs',      n:'Deal Drugs',       base:0.50, take:[1500,25000],    skill:'charisma', sentence:[2,8],  minAge:16 },
  { id:'fraud',      n:'Wire Fraud',       base:0.40, take:[4000,60000],    skill:'business', sentence:[2,7],  minAge:18 },
  { id:'cyber',      n:'Cybercrime',       base:0.42, take:[6000,120000],   skill:'tech',     sentence:[3,9],  minAge:16 },
  { id:'embezzle',   n:'Embezzlement',     base:0.44, take:[10000,250000],  skill:'business', sentence:[3,10], minAge:22, needJob:true },
  { id:'launder',    n:'Money Laundering', base:0.40, take:[20000,300000],  skill:'business', sentence:[4,12], minAge:22 },
  { id:'heist',      n:'Bank Heist',       base:0.18, take:[60000,900000],  skill:'combat',   sentence:[6,20], minAge:18 },
  { id:'artheist',   n:'Art Heist',        base:0.15, take:[150000,2000000],skill:'art',      sentence:[8,25], minAge:18 }
];

/* ---------------- WORLD NEWS (30) ---------------- */
DATA.news = [
  { id:'recession', t:'Recession grips the economy',            d:3, m:{invest:-0.35,jobs:-0.4,salary:-0.05} },
  { id:'boom',      t:'The economy enters a strong boom',       d:3, m:{invest:0.30,jobs:0.4,salary:0.05} },
  { id:'crash',     t:'Housing market crashes',                 d:2, m:{property:-0.35} },
  { id:'bubble',    t:'House prices surge to record highs',     d:3, m:{property:0.30} },
  { id:'cryptobull',t:'Crypto markets rally hard',              d:2, m:{crypto:0.9} },
  { id:'cryptobear',t:'Crypto markets collapse',                d:2, m:{crypto:-0.6} },
  { id:'layoffs',   t:'Mass layoffs sweep the tech sector',     d:2, m:{jobs:-0.3} },
  { id:'pandemic',  t:'A pandemic spreads worldwide',           d:2, m:{health:-4,jobs:-0.5,invest:-0.2} },
  { id:'war',       t:'A distant war unsettles markets',        d:2, m:{invest:-0.2,prices:0.1} },
  { id:'inflation', t:'Inflation spikes sharply',               d:3, m:{prices:0.18,salary:-0.02} },
  { id:'deflation', t:'Prices fall as demand collapses',        d:2, m:{prices:-0.1,jobs:-0.2} },
  { id:'wagerise',  t:'The minimum wage is raised',             d:4, m:{salary:0.06} },
  { id:'platform',  t:'A new social platform explodes',         d:3, m:{fame:0.5} },
  { id:'crimewave', t:'A crime wave hits your city',            d:2, m:{crimerisk:0.15} },
  { id:'policing',  t:'Police crack down on street crime',      d:3, m:{crimerisk:0.25} },
  { id:'medical',   t:'Medical breakthrough extends bequests', d:5, m:{health:2} },
  { id:'disaster',  t:'A natural disaster strikes the region',  d:1, m:{property:-0.15,health:-3} },
  { id:'aiboom',    t:'An AI boom reshapes white-collar work',  d:4, m:{jobs:-0.2,invest:0.25} },
  { id:'strike',    t:'A general strike paralyses the country', d:1, m:{salary:-0.08,jobs:-0.2} },
  { id:'taxcut',    t:'The government cuts income tax',         d:3, m:{taxcut:0.05} },
  { id:'taxrise',   t:'Taxes are raised to close the deficit',  d:3, m:{taxcut:-0.05} },
  { id:'energy',    t:'Energy prices spike',                    d:2, m:{prices:0.12} },
  { id:'greenboom', t:'Green industries attract huge investment',d:3,m:{invest:0.2,jobs:0.2} },
  { id:'scandal',   t:'A political scandal dominates the news', d:1, m:{} },
  { id:'olympics',  t:'The country hosts a major sporting event',d:1,m:{fame:0.3,jobs:0.15} },
  { id:'baby_boom', t:'A baby boom is under way',               d:3, m:{} },
  { id:'migration', t:'Record emigration drains the workforce', d:3, m:{salary:0.04,jobs:0.2} },
  { id:'housing_p', t:'Government launches a housing programme',d:3, m:{property:0.1} },
  { id:'bankfail',  t:'A major bank collapses',                 d:2, m:{invest:-0.3,jobs:-0.2} },
  { id:'goldrush',  t:'Investors pile into safe-haven assets',  d:2, m:{invest:0.12} }
];

/* ---------------- EPITAPHS (30) ---------------- */
DATA.ribs = [
  { id:'wealthy',   n:'Wealthy',        f:s=>s.peakNet>=1000000 },
  { id:'tycoon',    n:'Tycoon',         f:s=>s.peakNet>=10000000 },
  { id:'selfmade',  n:'Self-Made',      f:s=>s.peakNet>=500000 && s.birthTier<=1 },
  { id:'famous',    n:'Famous',         f:s=>s.followers>=500000 },
  { id:'criminal',  n:'Criminal',       f:s=>s.crimesCommitted>=8 || s.yearsJailed>=5 },
  { id:'kingpin',   n:'Kingpin',        f:s=>s.crimesCommitted>=20 && s.peakNet>=500000 },
  { id:'scholar',   n:'Scholar',        f:s=>s.edu>=4 && s.stats.smarts>=80 },
  { id:'athlete',   n:'Athlete',        f:s=>s.skills.fitness>=85 },
  { id:'artist',    n:'Artist',         f:s=>s.skills.art>=85 || s.skills.music>=85 },
  { id:'family',    n:'Family Person',  f:s=>s.childrenCount>=2 && s.marriedYears>=15 },
  { id:'lonely',    n:'Lonely',         f:s=>s.npcs.filter(n=>n.alive).length<=1 },
  { id:'deadbeat',  n:'Deadbeat',       f:s=>s.childrenCount>0 && s.stats.reputation<25 },
  { id:'healthy',   n:'Healthy',        f:s=>s.age>=80 && s.stats.health>=55 },
  { id:'addict',    n:'Addict',         f:s=>Object.keys(s.habits).some(k=>!DATA.habits[k].good && s.habits[k]>=70) },
  { id:'loyal',     n:'Loyal',          f:s=>s.marriedYears>=25 && !s.flags.cheated },
  { id:'hustler',   n:'Hustler',        f:s=>s.jobsHeld>=6 },
  { id:'survivor',  n:'Survivor',       f:s=>s.age>=90 },
  { id:'tragic',    n:'Tragic',         f:s=>s.age<40 },
  { id:'philanthropist',n:'Philanthropist',f:s=>s.donated>=100000 },
  { id:'unremarkable',n:'Unremarkable', f:s=>s.peakNet<40000&&s.followers<1000&&s.crimesCommitted===0&&s.jobsHeld<=1&&s.childrenCount===0 },
  { id:'wanderer',  n:'Wanderer',       f:s=>(s.countriesLived||[]).length>=3 },
  { id:'romantic',  n:'Romantic',       f:s=>(s.counters&&s.counters.partners>=5) },
  { id:'recluse',   n:'Recluse',        f:s=>s.npcs.filter(n=>n.rel==='friend').length===0 && s.age>=40 },
  { id:'jailbird',  n:'Jailbird',       f:s=>s.yearsJailed>=15 },
  { id:'genius_r',  n:'Genius',         f:s=>s.stats.smarts>=98 },
  { id:'beautiful_r',n:'Beautiful',     f:s=>s.stats.looks>=95 },
  { id:'respected', n:'Respected',      f:s=>s.stats.reputation>=90 },
  { id:'disgraced', n:'Disgraced',      f:s=>s.stats.reputation<=10 },
  { id:'workhorse', n:'Workhorse',      f:s=>s.totalWorked>=45 },
  { id:'heir_r',    n:'Heir',           f:s=>s.gen>=2 }
];
