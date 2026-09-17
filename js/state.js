// ── STATE ─────────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  inventory:  [],
  sales:      [],
  purchases:  [],
  prices:     {},
};

let state     = { ...DEFAULT_STATE };
let ghToken   = '';
let ghFileSHA = '';

function getToken()  { return ghToken; }
function setToken(t) { ghToken = t; localStorage.setItem('aq_token', t); }
function loadToken() { ghToken = localStorage.getItem('aq_token') || ''; }

function saveLocal() {
  localStorage.setItem('aq_state', JSON.stringify(state));
}

function loadLocal() {
  try {
    const raw = localStorage.getItem('aq_state');
    if (raw) state = { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch(e) {}
}

function getState()       { return state; }
function setState(data)   { state = { ...DEFAULT_STATE, ...data }; saveLocal(); }
function getSHA()         { return ghFileSHA; }
function setSHA(sha)      { ghFileSHA = sha; }
