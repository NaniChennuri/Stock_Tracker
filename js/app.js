// ── NAVIGATION ────────────────────────────────────────────────────────────
let activePage = 'dashboard';

const PAGES = {
  dashboard: { label: 'Dashboard', icon: '⊞', render: renderDashboard },
  inventory:  { label: 'Inventory',  icon: '📦', render: renderInventory },
  purchases:  { label: 'Purchases',  icon: '🛒', render: renderPurchases },
  sales:      { label: 'Sales',      icon: '💸', render: renderSales },
  debits:     { label: 'Debits',     icon: '📋', render: renderDebits },
  settings:   { label: 'Settings',   icon: '⚙',  render: renderSettings },
};

function navigate(page) {
  activePage = page;
  renderNav();
  PAGES[page].render();
  document.getElementById('app-content').scrollTop = 0;
}

function renderNav() {
  // sidebar (desktop)
  document.getElementById('sidebar').innerHTML = Object.entries(PAGES).map(([key, p]) => `
    <div class="nav-item ${activePage === key ? 'active' : ''}" onclick="navigate('${key}')">
      <span class="nav-icon">${p.icon}</span>
      <span class="nav-label">${p.label}</span>
    </div>
  `).join('');

  // bottom tabs (mobile)
  document.getElementById('bottom-nav').innerHTML = Object.entries(PAGES).map(([key, p]) => `
    <div class="tab-item ${activePage === key ? 'active' : ''}" onclick="navigate('${key}')">
      <span class="tab-icon">${p.icon}</span>
      <span class="tab-label">${p.label}</span>
    </div>
  `).join('');
}

// ── MODAL ─────────────────────────────────────────────────────────────────
function showModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

document.addEventListener('click', e => {
  if (e.target.id === 'modal-overlay') closeModal();
});

// ── SAVE ──────────────────────────────────────────────────────────────────
async function saveAll() {
  saveLocal();
  const ok = await ghSave();
  showToast(ok ? '✓ Saved to GitHub' : '✓ Saved locally only', ok ? 'ok' : 'warn');
}

// ── TOAST ─────────────────────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── RESET TOKEN ───────────────────────────────────────────────────────────
function resetToken() {
  localStorage.removeItem('aq_token');
  location.reload();
}

// ── APP BOOT ──────────────────────────────────────────────────────────────
function renderApp() {
  renderNav();
  navigate('dashboard');
}

// ── KEYBOARD ──────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const pinVisible = document.getElementById('screen-pin').style.display === 'flex';
  if (!pinVisible) return;
  if (e.key >= '0' && e.key <= '9') pinPress(e.key);
  if (e.key === 'Backspace') pinPress('del');
});

// ── INIT ──────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', initAuth);
