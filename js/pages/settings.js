// ── SETTINGS ──────────────────────────────────────────────────────────────
function renderSettings() {
  const s = getState();

  document.getElementById('app-content').innerHTML = `
    <div class="page-title">Settings</div>

    <div class="section-title">Companies</div>
    <div class="company-list" id="company-list">
      ${s.companies.map(c => `
        <div class="company-tag-row">
          <span class="company-tag">${c}</span>
          <button class="btn-remove-row" onclick="deleteCompany('${c}')">✕</button>
        </div>`).join('')}
    </div>
    <div class="add-company-row">
      <input class="form-input" id="new-company" placeholder="Add company name..." style="flex:1"/>
      <button class="btn-primary" onclick="addCompany()">Add</button>
    </div>

    <div class="section-title" style="margin-top:28px">Low Stock Threshold</div>
    <div class="form-row" style="align-items:center;gap:12px">
      <input class="form-input" id="threshold-input" type="number" min="1"
        value="${s.settings.lowStockThreshold}" style="max-width:100px"/>
      <button class="btn-primary" onclick="saveThreshold()">Save</button>
    </div>
    <div class="setting-hint">Products with quantity at or below this number will show as low stock.</div>

    <div class="section-title" style="margin-top:28px">Account</div>
    <button class="btn-danger" onclick="confirmResetToken()">Reset Token</button>
    <div class="setting-hint">Clears the saved token. You will need to enter it again on next visit.</div>
  `;
}

function addCompany() {
  const input = document.getElementById('new-company');
  const name  = input.value.trim().toUpperCase();
  if (!name) return;
  const s = getState();
  if (s.companies.includes(name)) { showToast('Company already exists', 'err'); return; }
  s.companies.push(name);
  saveLocal();
  input.value = '';
  showToast('Company added', 'ok');
  renderSettings();
}

function deleteCompany(name) {
  const s = getState();
  s.companies = s.companies.filter(c => c !== name);
  saveLocal();
  showToast('Company removed', 'ok');
  renderSettings();
}

function saveThreshold() {
  const val = parseInt(document.getElementById('threshold-input').value);
  if (!val || val < 1) { showToast('Enter a valid number', 'err'); return; }
  const s = getState();
  s.settings.lowStockThreshold = val;
  saveLocal();
  showToast('Threshold saved', 'ok');
}

function confirmResetToken() {
  showModal(`
    <div class="modal-header">
      <div class="modal-title">Reset Token</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="confirm-msg">This will clear your saved token. You will need to enter it again on next visit.</div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-danger"    onclick="resetToken()">Reset</button>
    </div>
  `);
}
