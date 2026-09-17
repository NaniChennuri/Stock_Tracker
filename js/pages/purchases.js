// ── PURCHASES (Stock In) ──────────────────────────────────────────────────
let purchaseItems = [];
let purchaseFilter = { from: '', to: '', company: '' };

function renderPurchases() {
  const b = getActiveBranch();
  let history = [...b.purchases].reverse();

  if (purchaseFilter.from)    history = history.filter(p => p.date >= purchaseFilter.from);
  if (purchaseFilter.to)      history = history.filter(p => p.date <= purchaseFilter.to);
  if (purchaseFilter.company) history = history.filter(p => p.company === purchaseFilter.company);

  const total = history.reduce((a, p) => a + p.items.reduce((x, i) => x + (i.qty * (i.buyPrice||0)), 0), 0);

  document.getElementById('app-content').innerHTML = `
    <div class="page-header">
      <div class="page-title">Purchases</div>
      <button class="btn-primary" onclick="openAddPurchase()">+ New</button>
    </div>
    <div class="filter-bar">
      <input class="filter-input" type="date" placeholder="From" value="${purchaseFilter.from}"
        onchange="purchaseFilter.from=this.value; renderPurchases()" style="flex:none;width:140px"/>
      <input class="filter-input" type="date" placeholder="To" value="${purchaseFilter.to}"
        onchange="purchaseFilter.to=this.value; renderPurchases()" style="flex:none;width:140px"/>
      <select class="filter-select" onchange="purchaseFilter.company=this.value; renderPurchases()">
        <option value="">All Companies</option>
        ${getState().companies.map(c => `<option value="${c}" ${purchaseFilter.company===c?'selected':''}>${c}</option>`).join('')}
      </select>
      ${(purchaseFilter.from||purchaseFilter.to||purchaseFilter.company) ? `<button class="btn-secondary" style="white-space:nowrap" onclick="purchaseFilter={from:'',to:'',company:''};renderPurchases()">✕ Clear</button>` : ''}
    </div>
    ${history.length > 0 ? `<div class="filter-summary">Showing ${history.length} record${history.length>1?'s':''} · Total: <span class="blue">${fmtCurrency(total)}</span></div>` : ''}
    ${history.length === 0
      ? `<div class="empty-msg">No purchases found.</div>`
      : `<div class="history-list">
          ${history.map(p => {
            const ptotal = p.items.reduce((a,i) => a + (i.qty * (i.buyPrice||0)), 0);
            return `
            <div class="history-card" onclick="openPurchaseDetail('${p.id}')">
              <div class="history-card-top">
                <span class="history-company">${p.company}</span>
                <span class="history-date">${fmtDate(p.date)}</span>
              </div>
              <div class="history-card-bottom">
                <span class="history-items-preview">
                  ${p.items.slice(0,3).map(i => `${i.name} ${i.unit} × ${i.qty}`).join(', ')}
                  ${p.items.length > 3 ? ` +${p.items.length-3} more` : ''}
                </span>
                <span class="history-total blue">${fmtCurrency(ptotal)}</span>
              </div>
            </div>`;
          }).join('')}
        </div>`}
  `;
}

function openAddPurchase() { purchaseItems = []; showModal(purchaseForm()); }

function purchaseForm() {
  const b = getActiveBranch();
  return `
    <div class="modal-header">
      <div class="modal-title">New Purchase</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Company</label>
        <select class="form-input" id="p-company">
          ${getState().companies.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="p-date" type="date" value="${todayStr()}"/>
      </div>
    </div>
    <div class="form-label" style="margin-bottom:8px">Items</div>
    <div id="purchase-items">${purchaseItems.map((item,i) => purchaseItemRow(item,i)).join('')}</div>
    <button class="btn-add-row" onclick="addPurchaseItemRow()">+ Add Item</button>
    <div class="modal-actions" style="margin-top:20px">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="savePurchase()">Save</button>
    </div>
  `;
}

function purchaseItemRow(item, i) {
  const b = getActiveBranch();
  return `
    <div class="item-row" id="prow-${i}">
      <select class="form-input item-product" onchange="onPurchaseProductSelect(this,${i})">
        <option value="">Select product...</option>
        ${b.inventory.map(p => `<option value="${p.id}" ${item.productId===p.id?'selected':''}>${p.name} ${p.unit}</option>`).join('')}
      </select>
      <input class="form-input item-qty" type="number" min="1" placeholder="Qty"
        value="${item.qty||''}" oninput="purchaseItems[${i}].qty=parseInt(this.value)||0"/>
      <input class="form-input item-price" type="number" min="0" placeholder="Buy ₹"
        value="${item.buyPrice||''}" oninput="purchaseItems[${i}].buyPrice=parseFloat(this.value)||0"/>
      <button class="btn-remove-row" onclick="removePurchaseRow(${i})">✕</button>
    </div>
  `;
}

function syncPurchaseItemsFromDOM() {
  const b = getActiveBranch();
  document.querySelectorAll('#purchase-items .item-row').forEach((row, i) => {
    if (!purchaseItems[i]) return;
    const sel = row.querySelector('.item-product');
    const p   = b.inventory.find(x => x.id === sel.value);
    purchaseItems[i].productId = sel.value;
    purchaseItems[i].qty      = parseInt(row.querySelector('.item-qty').value)   || 0;
    purchaseItems[i].buyPrice = parseFloat(row.querySelector('.item-price').value) || 0;
    if (p) { purchaseItems[i].name = p.name; purchaseItems[i].unit = p.unit; }
  });
}
function addPurchaseItemRow() {
  syncPurchaseItemsFromDOM();
  purchaseItems.push({ productId:'', qty:0, buyPrice:0 });
  document.getElementById('purchase-items').innerHTML = purchaseItems.map((item,i) => purchaseItemRow(item,i)).join('');
}
function removePurchaseRow(i) {
  syncPurchaseItemsFromDOM();
  purchaseItems.splice(i,1);
  document.getElementById('purchase-items').innerHTML = purchaseItems.map((item,i) => purchaseItemRow(item,i)).join('');
}
function onPurchaseProductSelect(sel, i) {
  const p = getActiveBranch().inventory.find(x => x.id === sel.value);
  purchaseItems[i].productId = sel.value;
  purchaseItems[i].name = p ? p.name : '';
  purchaseItems[i].unit = p ? p.unit : '';
}

function savePurchase() {
  const company = document.getElementById('p-company').value;
  const date    = document.getElementById('p-date').value;
  if (!date) { showToast('Select a date', 'err'); return; }
  const b       = getActiveBranch();

  syncPurchaseItemsFromDOM();
  const valid = purchaseItems.filter(i => i.productId && i.qty > 0);
  if (valid.length === 0) { showToast('Add at least one item', 'err'); return; }

  valid.forEach(item => {
    const idx = b.inventory.findIndex(x => x.id === item.productId);
    if (idx >= 0) {
      b.inventory[idx].qty += item.qty;
      if (item.buyPrice > 0) b.inventory[idx].buyPrice = item.buyPrice;
    }
  });

  b.purchases.push({ id: uid(), date, company, items: valid });
  saveLocal(); closeModal();
  showToast('Purchase saved', 'ok');
  renderPurchases();
}

function openPurchaseDetail(id) {
  const p = getActiveBranch().purchases.find(x => x.id === id);
  if (!p) return;
  const total = p.items.reduce((a,i) => a + (i.qty * (i.buyPrice||0)), 0);
  showModal(`
    <div class="modal-header">
      <div><div class="modal-title">${p.company}</div><div class="modal-sub">${fmtDate(p.date)}</div></div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="detail-items">
      ${p.items.map(i => `
        <div class="detail-item-row">
          <span>${i.name} <span class="unit-tag">${i.unit}</span></span>
          <span>× ${i.qty}</span>
          <span>${i.buyPrice ? fmtCurrency(i.buyPrice) : '—'}</span>
          <span class="blue">${i.buyPrice ? fmtCurrency(i.qty * i.buyPrice) : '—'}</span>
        </div>`).join('')}
    </div>
    <div class="detail-total">Total: <span class="blue">${fmtCurrency(total)}</span></div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Close</button>
      <button class="btn-danger"    onclick="deletePurchase('${id}')">Delete</button>
    </div>
  `);
}

function deletePurchase(id) {
  const b = getActiveBranch();
  const p = b.purchases.find(x => x.id === id);
  if (p) {
    p.items.forEach(item => {
      const idx = b.inventory.findIndex(x => x.id === item.productId);
      if (idx >= 0) b.inventory[idx].qty = Math.max(0, b.inventory[idx].qty - item.qty);
    });
  }
  b.purchases = b.purchases.filter(x => x.id !== id);
  saveLocal(); closeModal();
  showToast('Purchase deleted', 'ok');
  renderPurchases();
}
