// ── SETTINGS ──────────────────────────────────────────────────────────────
function renderSettings() {
  const s = getState();
  const b = getActiveBranch();

  document.getElementById('app-content').innerHTML = `
    <div class="page-title">Settings</div>
    <div class="settings-grid">

      <!-- BRANCHES -->
      <div class="settings-card">
        <div class="settings-card-header">
          <span class="settings-card-icon">🏢</span>
          <div>
            <div class="settings-card-title">Branches</div>
            <div class="settings-card-sub">Manage store branches</div>
          </div>
        </div>
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
          <button class="btn-primary" onclick="addBranch()">Add</button>
        </div>
      </div>

      <!-- COMPANIES -->
      <div class="settings-card">
        <div class="settings-card-header">
          <span class="settings-card-icon">🏭</span>
          <div>
            <div class="settings-card-title">Companies</div>
            <div class="settings-card-sub">Shared across all branches</div>
          </div>
        </div>
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
      </div>

      <!-- ITEMS CATALOG -->
      <div class="settings-card settings-card-wide">
        <div class="settings-card-header">
          <span class="settings-card-icon">📦</span>
          <div>
            <div class="settings-card-title">Items Catalog</div>
            <div class="settings-card-sub">Global product list shared across all branches</div>
          </div>
          <button class="btn-primary" style="margin-left:auto" onclick="openAddItem()">+ Add Item</button>
        </div>
        <div class="items-filter-row">
          <input class="filter-input" id="items-search" placeholder="Search items..." oninput="filterItemsList(this.value)" style="flex:1;min-width:0"/>
          <select class="filter-select" id="items-company-filter" onchange="filterItemsList(document.getElementById('items-search').value)">
            <option value="">All Companies</option>
            ${b.companies.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div id="items-catalog-list">${renderItemsCatalogRows()}</div>
      </div>

      <!-- CUSTOMERS -->
      <div class="settings-card">
        <div class="settings-card-header">
          <span class="settings-card-icon">👥</span>
          <div>
            <div class="settings-card-title">Customers</div>
            <div class="settings-card-sub">Auto-added on first sale</div>
          </div>
        </div>
        <div class="company-list">
          ${(s.customers||[]).map(c => `
            <div class="company-tag-row">
              <span class="company-tag">${c.name}</span>
              <button class="btn-remove-row" onclick="deleteCustomer('${c.id}')">✕</button>
            </div>`).join('')}
          ${(s.customers||[]).length === 0 ? '<div style="font-size:12px;color:var(--muted);padding:4px 0">No customers yet.</div>' : ''}
        </div>
        <div class="add-company-row">
          <input class="form-input" id="new-customer" placeholder="Add customer name..." style="flex:1"/>
          <button class="btn-primary" onclick="addCustomer()">Add</button>
        </div>
      </div>

      <!-- LOW STOCK THRESHOLD -->
      <div class="settings-card">
        <div class="settings-card-header">
          <span class="settings-card-icon">⚠️</span>
          <div>
            <div class="settings-card-title">Low Stock Threshold</div>
            <div class="settings-card-sub">Alert when qty is at or below this value</div>
          </div>
        </div>
        <div class="form-row" style="align-items:center;gap:12px;margin-top:8px">
          <input class="form-input" id="threshold-input" type="number" min="1"
            value="${s.settings.lowStockThreshold}" style="max-width:100px"/>
          <button class="btn-primary" onclick="saveThreshold()">Save</button>
        </div>
      </div>

      <!-- ACCOUNT -->
      <div class="settings-card">
        <div class="settings-card-header">
          <span class="settings-card-icon">🔑</span>
          <div>
            <div class="settings-card-title">Account</div>
            <div class="settings-card-sub">Clears token — re-enter on next visit</div>
          </div>
        </div>
        <div style="margin-top:12px">
          <button class="btn-danger" onclick="confirmResetToken()">Reset Token</button>
        </div>
      </div>

    </div>
  `;
}

function renderItemsCatalogRows(search, companyFilter) {
  const s = getState();
  const b = getActiveBranch();
  let items = s.items || [];
  if (companyFilter) items = items.filter(i => i.company === companyFilter);
  if (search) items = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.company.toLowerCase().includes(search.toLowerCase())
  );

  if (items.length === 0) return '<div class="empty-msg">No items found.</div>';

  const groups = {};
  items.forEach(i => { if (!groups[i.company]) groups[i.company] = []; groups[i.company].push(i); });

  return Object.entries(groups).map(([company, list]) => `
    <div class="group-label">${company}</div>
    ${list.map(i => `
      <div class="company-tag-row">
        <div style="flex:1;min-width:0">
          <span class="company-tag">${i.name}</span>
          <span style="font-size:11px;color:var(--muted);margin-left:8px">${i.unit}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="btn-secondary" style="padding:4px 10px;font-size:12px" onclick="openEditItem('${i.id}')">Edit</button>
          <button class="btn-remove-row" onclick="confirmDeleteItem('${i.id}')">✕</button>
        </div>
      </div>`).join('')}
  `).join('');
}

function filterItemsList(search) {
  const companyFilter = document.getElementById('items-company-filter')?.value || '';
  const el = document.getElementById('items-catalog-list');
  if (el) el.innerHTML = renderItemsCatalogRows(search, companyFilter);
}

// ── ITEM MANAGEMENT ───────────────────────────────────────────────────────
function openAddItem() { showModal(itemForm(null)); }
function openEditItem(id) {
  const item = (getState().items || []).find(i => i.id === id);
  if (item) showModal(itemForm(item));
}

function itemForm(item) {
  const b = getActiveBranch();
  return `
    <div class="modal-header">
      <div class="modal-title">${item ? 'Edit Item' : 'Add Item'}</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-group">
      <label class="form-label">Company</label>
      <select class="form-input" id="fi-company">
        ${b.companies.map(c => `<option value="${c}" ${item?.company===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Item Name</label>
      <input class="form-input" id="fi-name" placeholder="e.g. BIOVET-YC" value="${item?.name||''}"/>
    </div>
    <div class="form-group">
      <label class="form-label">Unit / Size</label>
      <input class="form-input" id="fi-unit" placeholder="e.g. 25KG" value="${item?.unit||''}"/>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveItem('${item?.id||''}')">Save</button>
    </div>
  `;
}

function saveItem(id) {
  const name = document.getElementById('fi-name').value.trim().toUpperCase();
  const unit = document.getElementById('fi-unit').value.trim().toUpperCase();
  const company = document.getElementById('fi-company').value;
  if (!name) { showToast('Item name is required', 'err'); return; }

  const s = getState();
  if (!s.items) s.items = [];

  if (id) {
    const idx = s.items.findIndex(i => i.id === id);
    if (idx >= 0) {
      const old = s.items[idx];
      s.items[idx] = { ...old, company, name, unit };
      s.branches.forEach(br => {
        br.inventory.forEach(p => {
          if (p.id === id) { p.company = company; p.name = name; p.unit = unit; }
        });
      });
    }
  } else {
    const newItem = { id: uid(), company, name, unit };
    s.items.push(newItem);
  }

  saveLocal(); closeModal();
  showToast(id ? 'Item updated' : 'Item added', 'ok');
  renderSettings();
}

function confirmDeleteItem(id) {
  const item = (getState().items || []).find(i => i.id === id);
  if (!item) return;
  const inUse = getState().branches.some(br => br.inventory.some(p => p.id === id));
  showModal(`
    <div class="modal-header">
      <div class="modal-title">Delete Item</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="confirm-msg">
      Delete <b>${item.name} (${item.unit})</b>?
      ${inUse ? '<br><span style="color:var(--amber)">⚠ This item exists in branch inventory. Removing from catalog will not delete inventory records.</span>' : ''}
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-danger" onclick="deleteItem('${id}')">Delete</button>
    </div>
  `);
}

function deleteItem(id) {
  const s = getState();
  s.items = (s.items || []).filter(i => i.id !== id);
  saveLocal(); closeModal();
  showToast('Item removed from catalog', 'ok');
  renderSettings();
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
  const s = getState();
  let alreadyAll = s.branches.every(br => br.companies.includes(name));
  if (alreadyAll) { showToast('Company already exists', 'err'); return; }
  s.branches.forEach(br => { if (!br.companies.includes(name)) br.companies.push(name); });
  saveLocal(); input.value = '';
  showToast('Company added to all branches', 'ok');
  renderSettings();
}

function deleteCompany(name) {
  const s = getState();
  const inUse = s.branches.some(br => br.inventory.some(p => p.company === name));
  if (inUse) { showToast(`Cannot remove — ${name} has products in inventory`, 'err'); return; }
  s.branches.forEach(br => { br.companies = br.companies.filter(c => c !== name); });
  saveLocal();
  showToast('Company removed from all branches', 'ok');
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

// ── CUSTOMER MANAGEMENT ───────────────────────────────────────────────────
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
