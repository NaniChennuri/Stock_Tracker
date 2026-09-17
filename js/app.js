// ── APP SHELL ─────────────────────────────────────────────────────────────
function renderApp() {
  document.getElementById('app-content').innerHTML = `
    <div class="landing">
      <div class="landing-title">${CONFIG.app_name}</div>
      <div class="landing-sub">Select a section to get started</div>
    </div>
  `;
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

// ── KEYBOARD — PIN ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const pinVisible = document.getElementById('screen-pin').style.display === 'flex';
  if (!pinVisible) return;
  if (e.key >= '0' && e.key <= '9') pinPress(e.key);
  if (e.key === 'Backspace') pinPress('del');
});

// ── SAVE ─────────────────────────────────────────────────────────────────
async function saveAll() {
  saveLocal();
  const ok = await ghSave();
  showToast(ok ? '✓ Saved to GitHub' : '✓ Saved locally only', ok ? 'ok' : 'warn');
}

// ── RESET TOKEN ───────────────────────────────────────────────────────────
function resetToken() {
  localStorage.removeItem('aq_token');
  location.reload();
}

// ── START ─────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', initAuth);
