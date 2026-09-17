// ── AUTH SCREENS ──────────────────────────────────────────────────────────

// ── TOKEN SETUP ───────────────────────────────────────────────────────────
function showTokenScreen() {
  document.getElementById('screen-token').style.display = 'flex';
  document.getElementById('screen-pin').style.display   = 'none';
  document.getElementById('screen-app').style.display   = 'none';
}

async function submitToken() {
  const input = document.getElementById('token-input');
  const btn   = document.getElementById('token-btn');
  const err   = document.getElementById('token-error');
  const token = input.value.trim();

  if (!token) { showTokenError('Please enter your GitHub token.'); return; }

  btn.textContent = 'Verifying…';
  btn.disabled    = true;
  err.style.display = 'none';

  const valid = await validateToken(token);
  if (valid) {
    setToken(token);
    showPinScreen();
  } else {
    showTokenError('Invalid token or no access to repository.');
    btn.textContent = 'Connect';
    btn.disabled    = false;
  }
}

function showTokenError(msg) {
  const err = document.getElementById('token-error');
  err.textContent   = msg;
  err.style.display = 'block';
}

// ── PIN SCREEN ────────────────────────────────────────────────────────────
let pinValue = '';

function showPinScreen() {
  document.getElementById('screen-token').style.display = 'none';
  document.getElementById('screen-pin').style.display   = 'flex';
  document.getElementById('screen-app').style.display   = 'none';
  pinValue = '';
  renderPinDots();
  document.getElementById('pin-error').style.display = 'none';
}

function pinPress(val) {
  if (val === 'del') {
    pinValue = pinValue.slice(0, -1);
  } else if (pinValue.length < 4) {
    pinValue += val;
  }
  renderPinDots();
  if (pinValue.length === 4) checkPin();
}

function renderPinDots() {
  document.querySelectorAll('.pin-dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < pinValue.length);
  });
}

async function checkPin() {
  if (pinValue === CONFIG.pin) {
    document.getElementById('pin-error').style.display = 'none';
    await bootApp();
  } else {
    document.getElementById('pin-error').style.display = 'block';
    pinValue = '';
    setTimeout(() => renderPinDots(), 600);
  }
}

// ── BOOT APP ──────────────────────────────────────────────────────────────
async function bootApp() {
  document.getElementById('screen-pin').style.display  = 'none';
  document.getElementById('screen-app').style.display  = 'flex';
  showToast('Loading data…', 'info');
  const ok = await ghLoad();
  if (!ok) {
    // try localStorage backup first
    const local = localStorage.getItem('aq_data');
    if (local) {
      try { setState(JSON.parse(local)); showToast('✓ Data loaded (local backup)', 'ok'); renderApp(); return; } catch(e) {}
    }
    // fallback: load data.json from same origin
    try {
      const res = await fetch('data.json');
      if (res.ok) {
        setState(await res.json());
        showToast('✓ Data loaded (local)', 'ok');
      } else {
        showToast('Failed to load data', 'err');
      }
    } catch(e) {
      showToast('Failed to load data', 'err');
    }
  } else {
    showToast('✓ Data loaded', 'ok');
  }
  renderApp();
}

// ── INIT ──────────────────────────────────────────────────────────────────
function initAuth() {
  loadToken();
  loadLocal();
  if (getToken()) {
    showPinScreen();
  } else {
    showTokenScreen();
  }
}
