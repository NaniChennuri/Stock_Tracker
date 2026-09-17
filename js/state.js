// ── STATE ─────────────────────────────────────────────────────────────────
const SEED_INVENTORY = [
  { id:'ml001', company:'MICRO LABS',  name:'MYCOTOX',           unit:'25KG',  qty:2,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'ml002', company:'MICRO LABS',  name:'MICROVIT GOLD',     unit:'25KG',  qty:5,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'ml003', company:'MICRO LABS',  name:'MICROCEE',          unit:'1KG',   qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'ml004', company:'MICRO LABS',  name:'TRIPLE SHIELD',     unit:'1KG',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'ml005', company:'MICRO LABS',  name:'MICROSECURE',       unit:'5LT',   qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'ml006', company:'MICRO LABS',  name:'MEGATAZ',           unit:'50ML',  qty:100, buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'ml007', company:'MICRO LABS',  name:'MECONERVE GOLD',    unit:'1LT',   qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'em001', company:'EVERMARK',    name:'SOFTEX',            unit:'1KG',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'em002', company:'EVERMARK',    name:'TRUBAC',            unit:'1KG',   qty:2,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'em003', company:'EVERMARK',    name:'MEGATRON',          unit:'1KG',   qty:2,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk001', company:'MANKIND',     name:'TOTAVIT STRONG',    unit:'25KG',  qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk002', company:'MANKIND',     name:'TONAKIND-P',        unit:'1KG',   qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk003', company:'MANKIND',     name:'HEPAWAYS',          unit:'5LT',   qty:2,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk004', company:'MANKIND',     name:'HEPAMUST',          unit:'25KG',  qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk005', company:'MANKIND',     name:'TOXYOVER',          unit:'25KG',  qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk006', company:'MANKIND',     name:'VIROBRUIT',         unit:'1KG',   qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk007', company:'MANKIND',     name:'RESPOHERB',         unit:'1LT',   qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk008', company:'MANKIND',     name:'ELECTRODEST',       unit:'1KG',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk009', company:'MANKIND',     name:'ACID PURE',         unit:'5LT',   qty:2,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'mk010', company:'MANKIND',     name:'ENROSTRONG-20%',    unit:'1LT',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vq001', company:'VETOQUINOL',  name:'TOXORID AQUA',      unit:'25KG',  qty:10,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vq002', company:'VETOQUINOL',  name:'VETOMIN-S AQUA REACH', unit:'25KG', qty:10, buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vq003', company:'VETOQUINOL',  name:'VETOMIN-S AQUA',    unit:'25KG',  qty:10,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vq004', company:'VETOQUINOL',  name:'BIOVET-SP+',        unit:'200GR', qty:30,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vq005', company:'VETOQUINOL',  name:'BIOVET-YC',         unit:'25KG',  qty:40,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vq006', company:'VETOQUINOL',  name:'VEGUT',             unit:'1KG',   qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vq007', company:'VETOQUINOL',  name:'RESIMAX',           unit:'5LT',   qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vq008', company:'VETOQUINOL',  name:'IMMUNE-C',          unit:'1KG',   qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at001', company:'ALLTEC',      name:'DE-ODORISE',        unit:'1LT',   qty:20,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at002', company:'ALLTEC',      name:'DE-ODORISE',        unit:'500GR', qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at003', company:'ALLTEC',      name:'AQUA-SET',          unit:'500GR', qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at004', company:'ALLTEC',      name:'YEASAC',            unit:'5KG',   qty:5,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at005', company:'ALLTEC',      name:'DIGEST-54+',        unit:'1KG',   qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at006', company:'ALLTEC',      name:'BLUEPRINT',         unit:'1KG',   qty:10,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at007', company:'ALLTEC',      name:'AQUA-MOS',          unit:'1KG',   qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at008', company:'ALLTEC',      name:'VILIGEN',           unit:'1KG',   qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at009', company:'ALLTEC',      name:'BIOPLEX-COPPER',    unit:'1KG',   qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at010', company:'ALLTEC',      name:'ALLZYME-PRIME',     unit:'1KG',   qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at011', company:'ALLTEC',      name:'BIOPLEX-ZINC',      unit:'1KG',   qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'at012', company:'ALLTEC',      name:'SELPLEX',           unit:'1KG',   qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb001', company:'VIRBAC',      name:'CALGOPHOS',         unit:'4LT',   qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb002', company:'VIRBAC',      name:'AGRIMIN',           unit:'25KG',  qty:25,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb003', company:'VIRBAC',      name:'WATERMIN',          unit:'25KG',  qty:25,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb004', company:'VIRBAC',      name:'HEPANOMIX',         unit:'500GR', qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb005', company:'VIRBAC',      name:'V5',                unit:'1KG',   qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb006', company:'VIRBAC',      name:'ECO MARINE-80',     unit:'1KG',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb007', company:'VIRBAC',      name:'PRO MARINE',        unit:'500GR', qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb008', company:'VIRBAC',      name:'MV24',              unit:'1KG',   qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb009', company:'VIRBAC',      name:'O2 MARINE',         unit:'1KG',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb010', company:'VIRBAC',      name:'BIO MARINE',        unit:'1KG',   qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb011', company:'VIRBAC',      name:'SOKHRENE',          unit:'5LT',   qty:1,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'vb012', company:'VIRBAC',      name:'KHORSOLIN',         unit:'5LT',   qty:1,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sz001', company:'SANZYNE',     name:'UNI-ECOSENSE',      unit:'500GR', qty:24,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sz002', company:'SANZYNE',     name:'UNI-ECOSENSE',      unit:'1KG',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sz003', company:'SANZYNE',     name:'UNI-BKC',           unit:'1LT',   qty:10,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sz004', company:'SANZYNE',     name:'UNI-SANZODINE',     unit:'500GR', qty:10,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sz005', company:'SANZYNE',     name:'SANIT-F',           unit:'5LT',   qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sz006', company:'SANZYNE',     name:'UNI-POND',          unit:'5KG',   qty:4,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sz007', company:'SANZYNE',     name:'UNI-CLEAR',         unit:'20LT',  qty:2,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sz008', company:'SANZYNE',     name:'UNI-MAX',           unit:'1KG',   qty:6,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr001', company:'SERIN',       name:'RESIST',            unit:'500GR', qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr002', company:'SERIN',       name:'STIM-L',            unit:'500GR', qty:5,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr003', company:'SERIN',       name:'DEFENDER-G',        unit:'1KG',   qty:5,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr004', company:'SERIN',       name:'AROMIN',            unit:'5LT',   qty:1,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr005', company:'SERIN',       name:'ROBUST',            unit:'5LT',   qty:1,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr006', company:'SERIN',       name:'SERIGEL',           unit:'20LT',  qty:2,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr007', company:'SERIN',       name:'ZEOSER',            unit:'25KG',  qty:85,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr008', company:'SERIN',       name:'SERIMIN-NANO',      unit:'5LT',   qty:1,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr009', company:'SERIN',       name:'SILVER GOLD',       unit:'5LT',   qty:1,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'sr010', company:'SERIN',       name:'SILVER GOLD',       unit:'LT',    qty:3,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'kp001', company:'KCP',         name:'DELTIN-2.8%',       unit:'1LT',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'kp002', company:'KCP',         name:'MITRAZ',            unit:'1LT',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'kp003', company:'KCP',         name:'DELTIN-1.7',        unit:'1LT',   qty:12,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'kp004', company:'KCP',         name:'TAKTIC',            unit:'250ML', qty:40,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'pr001', company:'PRESTIGE',    name:'PRESTIGE YEAST',    unit:'10KG',  qty:20,  buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
  { id:'pr002', company:'PRESTIGE',    name:'NOVA BLUE',         unit:'500GR', qty:0,   buyPrice:0, sellPrice:0, expiry:'', description:'', howToUse:'' },
];

const SEED_COMPANIES = ['MICRO LABS','EVERMARK','MANKIND','VETOQUINOL','ALLTEC','VIRBAC','SANZYNE','SERIN','KCP','PRESTIGE'];

// Global item catalog (shared across all branches)
const SEED_ITEMS = SEED_INVENTORY.map(p => ({ id: p.id, company: p.company, name: p.name, unit: p.unit }));

const DEFAULT_STATE = {
  branches: [
    {
      id: 'main', name: 'Main Branch',
      companies: [...SEED_COMPANIES],
      inventory: [],
      purchases: [], sales: [], debits: [],
    },
    {
      id: 'mudunepalli', name: 'Mudunepalli',
      companies: [...SEED_COMPANIES],
      inventory: SEED_INVENTORY,
      purchases: [], sales: [], debits: [],
    },
  ],
  items: SEED_ITEMS,
  customers: [],
  settings: { lowStockThreshold: 3 },
};

let state       = JSON.parse(JSON.stringify(DEFAULT_STATE));
let ghToken     = '';
let ghFileSHA   = '';
let activeBranchId = 'mudunepalli';

function getToken()    { return ghToken; }
function setToken(t)   { ghToken = t; localStorage.setItem('aq_token', t); }
function loadToken()   { ghToken = localStorage.getItem('aq_token') || ''; }

function saveLocal() {
  try { localStorage.setItem('aq_data', JSON.stringify(getState())); } catch(e) {}
}
function loadLocal() {
  try {
    const raw = localStorage.getItem('aq_data');
    if (raw) setState(JSON.parse(raw));
  } catch(e) {}
}

function getState()      { return state; }
function setState(data) {
  // migrate old flat structure → branch structure
  if (data && !data.branches) {
    const branch = {
      id: 'mudunepalli', name: 'Mudunepalli',
      companies: data.companies || [...SEED_COMPANIES],
      inventory: data.inventory || [],
      purchases: data.purchases || [],
      sales:     data.sales     || [],
      debits:    data.debits    || [],
    };
    state = {
      branches: [
        { id: 'main', name: 'Main Branch', companies: [...SEED_COMPANIES], inventory: [], purchases: [], sales: [], debits: [] },
        branch,
      ],
      settings: data.settings || { lowStockThreshold: 3 },
    };
  } else {
    state = {
      branches: data.branches || JSON.parse(JSON.stringify(DEFAULT_STATE.branches)),
      items: data.items || JSON.parse(JSON.stringify(DEFAULT_STATE.items)),
      customers: data.customers || [],
      settings: { ...DEFAULT_STATE.settings, ...(data.settings || {}) },
    };
  }
  saveLocal();
}

function getSHA()        { return ghFileSHA; }
function setSHA(sha)     { ghFileSHA = sha; }

function getActiveBranch() {
  return state.branches.find(b => b.id === activeBranchId) || state.branches[0];
}

function setActiveBranch(id) {
  activeBranchId = id;
  localStorage.setItem('aq_branch', id);
}

function loadActiveBranch() {
  activeBranchId = localStorage.getItem('aq_branch') || (state.branches[0]?.id || 'main');
  // ensure it still exists
  if (!state.branches.find(b => b.id === activeBranchId)) {
    activeBranchId = state.branches[0]?.id || 'main';
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// All dates in IST (UTC+5:30)
function istNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function todayStr() {
  const d = istNow();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateLong() {
  return istNow().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'Asia/Kolkata' });
}

function fmtCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const ist = istNow();
  const today = new Date(ist.getFullYear(), ist.getMonth(), ist.getDate());
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target - today) / 86400000);
}

function getCustomers() {
  return (getState().customers || []);
}

function normalizeCustomerName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
