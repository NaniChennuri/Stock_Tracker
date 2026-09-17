// ── SETTINGS ──────────────────────────────────────────────────────────────
function renderSettings() {
  const s = getState();
  const b = getActiveBranch();

  document.getElementById('app-content').innerHTML = `
    <div class="page-title">Settings</div>

    <div class="section-title">Branches</div>
    <div class="company-list">
      ${s.branches.map(br => `
        <div class="company-tag-row">
          <span class="company-tag">${br.name}</span>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn-secondary" style="padding:4px 10px;font-size:12px" onclick="renameBranchPrompt('${br.id}')">Rename</button>
            ${s.branches.length > 1
              ? `<button class="btn-remove-row" onclick="confirmDeleteBranch('${br.id}')">✕</button>`
              : '<span style="font-size:11px;color:var(--muted)">Default</span>'}
          </div>
        </div>`).join('')}
    </div>
    <div class="add-company-row">
      <input class="form-input" id="new-branch" placeholder="New branch name..." style="flex:1"/>
      <button class="btn-primary" onclick="addBranch()">Add Branch</button>
    </div>

    <div class="section-title" style="margin-top:28px">Companies — ${b.name}</div>
    <div class="company-list" id="company-list">
      ${b.companies.map(c => `
        <div class="company-tag-row">
          <span class="company-tag">${c}</span>
          <button class="btn-remove-row" onclick="deleteCompany('${c}')">✕</button>
        </div>`).join('')}
    </div>
    <div class="add-company-row">
      <input class="form-input" id="new-company" placeholder="Add company name..." style="flex:1"/>
      <button class="btn-primary" onclick="addCompany()">Add</button>
    </div>

    <div class="section-title" style="margin-top:28px">Customers</div>
    <div class="company-list">
      ${(s.customers||[]).map(c => `
        <div class="company-tag-row">
          <span class="company-tag">${c.name}</span>
          <button class="btn-remove-row" onclick="deleteCustomer('${c.id}')">✕</button>
        </div>`).join('')}
      ${(s.customers||[]).length === 0 ? '<div style="font-size:12px;color:var(--muted);padding:4px 0">No customers yet. They are added automatically when you record a sale.</div>' : ''}
    </div>
    <div class="add-company-row">
      <input class="form-input" id="new-customer" placeholder="Add customer name..." style="flex:1"/>
      <button class="btn-primary" onclick="addCustomer()">Add</button>
    </div>

    <div class="section-title" style="margin-top:28px">Low Stock Threshold</div>
    <div class="form-row" style="align-items:center;gap:12px">
      <input class="form-input" id="threshold-input" type="number" min="1"
        value="${s.settings.lowStockThreshold}" style="max-width:100px"/>
      <button class="btn-primary" onclick="saveThreshold()">Save</button>
    </div>
    <div class="setting-hint">Products at or below this quantity show as low stock.</div>

    <div class="section-title" style="margin-top:28px">Account</div>
    <button class="btn-danger" onclick="confirmResetToken()">Reset Token</button>
    <div class="setting-hint">Clears the saved token. You will need to enter it again on next visit.</div>
  `;
}

// ── BRANCH MANAGEMENT ─────────────────────────────────────────────────────
function addBranch() {
  const input = document.getElementById('new-branch');
  const name  = input.value.trim();
  if (!name) return;
  const s = getState();
  const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36);
  s.branches.push({
    id, name,
    companies: [...(getActiveBranch().companies)],
    inventory: [], purchases: [], sales: [], debits: [],
  });
  saveLocal(); input.value = '';
  showToast('Branch added', 'ok');
  renderSettings();
  renderBranchSelector();
}

function renameBranchPrompt(id) {
  const b = getState().branches.find(x => x.id === id);
  showModal(`
    <div class="modal-header">
      <div class="modal-title">Rename Branch</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-group">
      <label class="form-label">Branch Name</label>
      <input class="form-input" id="rename-branch-input" value="${b.name}"/>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="renameBranch('${id}')">Save</button>
    </div>
  `);
}

function renameBranch(id) {
  const name = document.getElementById('rename-branch-input').value.trim();
  if (!name) { showToast('Enter a name', 'err'); return; }
  const b = getState().branches.find(x => x.id === id);
  b.name = name;
  saveLocal(); closeModal();
  showToast('Branch renamed', 'ok');
  renderSettings();
  renderBranchSelector();
}

function confirmDeleteBranch(id) {
  const b = getState().branches.find(x => x.id === id);
  showModal(`
    <div class="modal-header">
      <div class="modal-title">Delete Branch</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="confirm-msg">Delete <b>${b.name}</b>? All inventory, purchases, sales and debits for this branch will be permanently deleted.</div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-danger" onclick="deleteBranch('${id}')">Delete</button>
    </div>
  `);
}

function deleteBranch(id) {
  const s = getState();
  s.branches = s.branches.filter(x => x.id !== id);
  if (activeBranchId === id || !s.branches.find(x => x.id === activeBranchId)) {
    setActiveBranch(s.branches[0].id);
  }
  saveLocal(); closeModal();
  showToast('Branch deleted', 'ok');
  renderBranchSelector();
  renderSettings();
}

// ── COMPANY MANAGEMENT ────────────────────────────────────────────────────
function addCompany() {
  const input = document.getElementById('new-company');
  const name  = input.value.trim().toUpperCase();
  if (!name) return;
  const b = getActiveBranch();
  if (b.companies.includes(name)) { showToast('Company already exists', 'err'); return; }
  b.companies.push(name);
  saveLocal(); input.value = '';
  showToast('Company added', 'ok');
  renderSettings();
}

function deleteCompany(name) {
  const b = getActiveBranch();
  const hasProducts = b.inventory.some(p => p.company === name);
  if (hasProducts) { showToast(`Cannot remove — ${name} has products in inventory`, 'err'); return; }
  b.companies = b.companies.filter(c => c !== name);
  saveLocal();
  showToast('Company removed', 'ok');
  renderSettings();
}

function saveThreshold() {
  const val = parseInt(document.getElementById('threshold-input').value);
  if (!val || val < 1) { showToast('Enter a valid number', 'err'); return; }
  getState().settings.lowStockThreshold = val;
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

// ── CUSTOMER MANAGEMENT ─────────────────────────────────────────────────────
function addCustomer() {
  const input = document.getElementById('new-customer');
  const name  = input.value.trim();
  if (!name) return;
  const s = getState();
  if (!s.customers) s.customers = [];
  const norm = normalizeCustomerName(name);
  if (s.customers.some(c => normalizeCustomerName(c.name) === norm)) {
    showToast('Customer already exists', 'err'); return;
  }
  s.customers.push({ id: uid(), name });
  saveLocal(); input.value = '';
  showToast('Customer added', 'ok');
  renderSettings();
}

function deleteCustomer(id) {
  const s = getState();
  s.customers = (s.customers || []).filter(c => c.id !== id);
  saveLocal();
  showToast('Customer removed', 'ok');
  renderSettings();
}
