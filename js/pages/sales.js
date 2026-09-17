// ── SALES (Stock Out) ─────────────────────────────────────────────────────
let saleItems = [];
let salePaymentType = 'paid';

function renderSales() {
  const b = getActiveBranch();
  const history = [...b.sales].reverse();
  document.getElementById('app-content').innerHTML = `
    <div class="page-header">
      <div class="page-title">Sales</div>
      <button class="btn-primary" onclick="openAddSale()">+ New</button>
    </div>
    ${history.length === 0
      ? `<div class="empty-msg">No sales recorded yet.</div>`
      : `<div class="history-list">
          ${history.map(sale => `
            <div class="history-card" onclick="openSaleDetail('${sale.id}')">
              <div class="history-card-top">
                <span class="history-company">${sale.customer || 'Unknown Customer'}</span>
                <span class="history-date">${fmtDate(sale.date)}</span>
              </div>
              <div class="history-card-bottom">
                <span class="history-items-preview">
                  ${sale.items.slice(0,2).map(i => `${i.name} × ${i.qty}`).join(', ')}
                  ${sale.items.length > 2 ? ` +${sale.items.length-2} more` : ''}
                </span>
                <span>
                  ${sale.paymentType === 'debit' ? '<span class="badge amber">Debit</span>' : ''}
                  <span class="history-total ${sale.paymentType==='debit'?'amber':'green'}">${fmtCurrency(sale.total)}</span>
                </span>
              </div>
            </div>`).join('')}
        </div>`}
  `;
}

function openAddSale() { saleItems = []; salePaymentType = 'paid'; showModal(saleForm()); }

function saleForm() {
  const total = saleItems.reduce((a,i) => a + (i.qty * i.price), 0);
  return `
    <div class="modal-header">
      <div class="modal-title">New Sale</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Customer (optional)</label>
        <input class="form-input" id="s-customer" placeholder="Customer name"/>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="s-date" type="date" value="${todayStr()}"/>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Payment</label>
      <div class="payment-toggle">
        <div class="pay-opt ${salePaymentType==='paid'?'active':''}" onclick="setSalePayment('paid')">✓ Paid</div>
        <div class="pay-opt debit ${salePaymentType==='debit'?'active':''}" onclick="setSalePayment('debit')">⏳ Debit</div>
      </div>
    </div>
    <div id="debit-due-row" style="display:${salePaymentType==='debit'?'block':'none'}" class="form-group">
      <label class="form-label">Expected Payment Date (optional)</label>
      <input class="form-input" id="s-duedate" type="date"/>
    </div>
    <div class="form-label" style="margin-bottom:8px">Items</div>
    <div id="sale-items">${saleItems.map((item,i) => saleItemRow(item,i)).join('')}</div>
    <button class="btn-add-row" onclick="addSaleItemRow()">+ Add Item</button>
    <div class="sale-total-bar">Total: <span class="sale-total-val green">${fmtCurrency(total)}</span></div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveSale()">Save</button>
    </div>
  `;
}

function setSalePayment(type) {
  salePaymentType = type;
  document.querySelectorAll('.pay-opt').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.pay-opt').forEach(el => {
    if ((type==='paid' && !el.classList.contains('debit')) ||
        (type==='debit' && el.classList.contains('debit'))) el.classList.add('active');
  });
  const dueRow = document.getElementById('debit-due-row');
  if (dueRow) dueRow.style.display = type === 'debit' ? 'block' : 'none';
}

function saleItemRow(item, i) {
  const b = getActiveBranch();
  return `
    <div class="item-row" id="srow-${i}">
      <select class="form-input item-product" onchange="onSaleProductSelect(this,${i})">
        <option value="">Select product...</option>
        ${b.inventory.map(p => `<option value="${p.id}" ${item.productId===p.id?'selected':''}>${p.name} ${p.unit}</option>`).join('')}
      </select>
      <input class="form-input item-qty" type="number" min="1" placeholder="Qty"
        value="${item.qty||''}" oninput="onSaleQtyChange(this,${i})"/>
      <input class="form-input item-price" type="number" min="0" placeholder="Price ₹"
        value="${item.price||''}" oninput="onSalePriceChange(this,${i})"/>
      <button class="btn-remove-row" onclick="removeSaleRow(${i})">✕</button>
    </div>
  `;
}

function onSaleProductSelect(sel, i) {
  const p = getActiveBranch().inventory.find(x => x.id === sel.value);
  saleItems[i].productId = sel.value;
  saleItems[i].name  = p ? p.name : '';
  saleItems[i].unit  = p ? p.unit : '';
  saleItems[i].price = p ? p.sellPrice : 0;
  const row = document.getElementById(`srow-${i}`);
  if (row) row.querySelector('.item-price').value = saleItems[i].price || '';
  updateSaleTotal();
}
function onSaleQtyChange(input, i)   { saleItems[i].qty   = parseInt(input.value)   || 0; updateSaleTotal(); }
function onSalePriceChange(input, i) { saleItems[i].price = parseFloat(input.value) || 0; updateSaleTotal(); }
function updateSaleTotal() {
  const total = saleItems.reduce((a,i) => a + ((i.qty||0)*(i.price||0)), 0);
  const el = document.querySelector('.sale-total-val');
  if (el) el.textContent = fmtCurrency(total);
}
function syncSaleItemsFromDOM() {
  const b = getActiveBranch();
  document.querySelectorAll('#sale-items .item-row').forEach((row, i) => {
    if (!saleItems[i]) return;
    const sel = row.querySelector('.item-product');
    const p   = b.inventory.find(x => x.id === sel.value);
    saleItems[i].productId = sel.value;
    saleItems[i].qty   = parseInt(row.querySelector('.item-qty').value)   || 0;
    saleItems[i].price = parseFloat(row.querySelector('.item-price').value) || 0;
    if (p) { saleItems[i].name = p.name; saleItems[i].unit = p.unit; }
  });
}
function addSaleItemRow() {
  syncSaleItemsFromDOM();
  saleItems.push({ productId:'', name:'', unit:'', qty:0, price:0 });
  document.getElementById('sale-items').innerHTML = saleItems.map((item,i) => saleItemRow(item,i)).join('');
}
function removeSaleRow(i) {
  saleItems.splice(i,1);
  document.getElementById('sale-items').innerHTML = saleItems.map((item,i) => saleItemRow(item,i)).join('');
  updateSaleTotal();
}

function saveSale() {
  const customer = document.getElementById('s-customer').value.trim();
  const date     = document.getElementById('s-date').value;
  const b        = getActiveBranch();

  document.querySelectorAll('#sale-items .item-row').forEach((row, i) => {
    const sel = row.querySelector('.item-product');
    const p   = b.inventory.find(x => x.id === sel.value);
    saleItems[i].productId = sel.value;
    saleItems[i].qty   = parseInt(row.querySelector('.item-qty').value)   || 0;
    saleItems[i].price = parseFloat(row.querySelector('.item-price').value) || 0;
    if (p) { saleItems[i].name = p.name; saleItems[i].unit = p.unit; }
  });

  const valid = saleItems.filter(i => i.productId && i.qty > 0);
  if (valid.length === 0) { showToast('Add at least one item', 'err'); return; }

  valid.forEach(item => {
    const idx = b.inventory.findIndex(x => x.id === item.productId);
    if (idx >= 0) b.inventory[idx].qty = Math.max(0, b.inventory[idx].qty - item.qty);
  });

  const total  = valid.reduce((a,i) => a + (i.qty * i.price), 0);
  const saleId = uid();
  b.sales.push({ id: saleId, date, customer, items: valid, total, paymentType: salePaymentType });

  if (salePaymentType === 'debit') {
    if (!b.debits) b.debits = [];
    const dueDate = document.getElementById('s-duedate')?.value || '';
    b.debits.push({ id: uid(), saleId, date, customer, total, paid: 0, dueDate, payments: [] });
  }

  saveLocal(); closeModal();
  showToast('Sale saved', 'ok');
  renderSales();
}

function openSaleDetail(id) {
  const sale = getActiveBranch().sales.find(x => x.id === id);
  if (!sale) return;
  showModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">${sale.customer || 'Unknown Customer'} ${sale.paymentType==='debit'?'<span class="badge amber">Debit</span>':'<span class="badge green-badge">Paid</span>'}</div>
        <div class="modal-sub">${fmtDate(sale.date)}</div>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="detail-items">
      ${sale.items.map(i => `
        <div class="detail-item-row">
          <span>${i.name} <span class="unit-tag">${i.unit}</span></span>
          <span>× ${i.qty}</span>
          <span>${fmtCurrency(i.price)}</span>
          <span class="green">${fmtCurrency(i.qty * i.price)}</span>
        </div>`).join('')}
    </div>
    <div class="detail-total">Total: <span class="${sale.paymentType==='debit'?'amber':'green'}">${fmtCurrency(sale.total)}</span></div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Close</button>
      <button class="btn-danger"    onclick="deleteSale('${id}')">Delete</button>
    </div>
  `);
}

function deleteSale(id) {
  const b = getActiveBranch();
  b.sales  = b.sales.filter(x => x.id !== id);
  b.debits = (b.debits || []).filter(x => x.saleId !== id);
  saveLocal(); closeModal();
  showToast('Sale deleted', 'ok');
  renderSales();
}
