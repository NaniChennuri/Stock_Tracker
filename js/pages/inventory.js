// ── INVENTORY ─────────────────────────────────────────────────────────────
let invFilter = { company: '', search: '' };

function renderInventory() {
  const s         = getState();
  const threshold = s.settings.lowStockThreshold;
  let   items     = s.inventory;

  if (invFilter.company) items = items.filter(p => p.company === invFilter.company);
  if (invFilter.search)  items = items.filter(p =>
    p.name.toLowerCase().includes(invFilter.search.toLowerCase())
  );

  // group by company
  const groups = {};
  items.forEach(p => {
    if (!groups[p.company]) groups[p.company] = [];
    groups[p.company].push(p);
  });

  document.getElementById('app-content').innerHTML = `
    <div class="page-header">
      <div class="page-title">Inventory</div>
      <button class="btn-primary" onclick="openAddProduct()">+ Add</button>
    </div>

    <div class="filter-bar">
      <input class="filter-input" placeholder="Search product..." value="${invFilter.search}"
        oninput="invFilter.search=this.value; renderInventory()"/>
      <select class="filter-select" onchange="invFilter.company=this.value; renderInventory()">
        <option value="">All Companies</option>
        ${s.companies.map(c => `<option value="${c}" ${invFilter.company===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>

    ${Object.keys(groups).length === 0
      ? `<div class="empty-msg">No products found.</div>`
      : Object.entries(groups).map(([company, products]) => `
          <div class="group-label">${company}</div>
          <div class="inv-table">
            <div class="inv-head">
              <span>Product</span><span>Unit</span><span>Qty</span><span>Sell ₹</span><span></span>
            </div>
            ${products.map(p => {
              const low     = p.qty <= threshold;
              const expDays = daysUntil(p.expiry);
              const expired = expDays !== null && expDays < 0;
              const expiring = expDays !== null && expDays >= 0 && expDays <= 30;
              return `
              <div class="inv-row ${low ? 'row-low' : ''} ${expired ? 'row-expired' : ''}"
                   onclick="openProductDetail('${p.id}')">
                <span class="inv-name">
                  ${p.name}
                  ${expired  ? '<span class="badge red">Expired</span>'  : ''}
                  ${expiring ? '<span class="badge amber">Exp soon</span>' : ''}
                </span>
                <span class="inv-unit">${p.unit}</span>
                <span class="inv-qty ${low ? 'red' : ''}">${p.qty}</span>
                <span class="inv-price">${p.sellPrice ? fmtCurrency(p.sellPrice) : '—'}</span>
                <span class="inv-arrow">›</span>
              </div>`;
            }).join('')}
          </div>`).join('')}
  `;
}

// ── PRODUCT DETAIL MODAL ──────────────────────────────────────────────────
function openProductDetail(id) {
  const p = getState().inventory.find(x => x.id === id);
  if (!p) return;
  const expDays = daysUntil(p.expiry);
  const margin  = p.sellPrice && p.buyPrice ? p.sellPrice - p.buyPrice : null;

  showModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">${p.name}</div>
        <div class="modal-sub">${p.company} · ${p.unit}</div>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>

    <div class="detail-grid">
      <div class="detail-item"><div class="detail-lbl">Quantity</div><div class="detail-val">${p.qty}</div></div>
      <div class="detail-item"><div class="detail-lbl">Buy Price</div><div class="detail-val">${p.buyPrice ? fmtCurrency(p.buyPrice) : '—'}</div></div>
      <div class="detail-item"><div class="detail-lbl">Sell Price</div><div class="detail-val">${p.sellPrice ? fmtCurrency(p.sellPrice) : '—'}</div></div>
      <div class="detail-item"><div class="detail-lbl">Margin</div><div class="detail-val ${margin > 0 ? 'green' : ''}">${margin !== null ? fmtCurrency(margin) : '—'}</div></div>
      <div class="detail-item"><div class="detail-lbl">Expiry</div><div class="detail-val ${expDays !== null && expDays < 0 ? 'red' : expDays !== null && expDays <= 30 ? 'amber' : ''}">${fmtDate(p.expiry)}</div></div>
    </div>

    ${p.description ? `<div class="detail-section"><div class="detail-sec-title">Description</div><div class="detail-text">${p.description}</div></div>` : ''}
    ${p.howToUse    ? `<div class="detail-section"><div class="detail-sec-title">How to Use</div><div class="detail-text">${p.howToUse}</div></div>` : ''}

    <div class="modal-actions">
      <button class="btn-secondary" onclick="openEditProduct('${p.id}')">Edit</button>
      <button class="btn-danger"    onclick="confirmDeleteProduct('${p.id}')">Delete</button>
    </div>
  `);
}

// ── ADD / EDIT PRODUCT ────────────────────────────────────────────────────
function openAddProduct() {
  showModal(productForm(null));
}

function openEditProduct(id) {
  const p = getState().inventory.find(x => x.id === id);
  showModal(productForm(p));
}

function productForm(p) {
  const s = getState();
  return `
    <div class="modal-header">
      <div class="modal-title">${p ? 'Edit Product' : 'Add Product'}</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-group">
      <label class="form-label">Company</label>
      <select class="form-input" id="f-company">
        ${s.companies.map(c => `<option value="${c}" ${p?.company===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Product Name</label>
      <input class="form-input" id="f-name" placeholder="e.g. BIOVET-YC" value="${p?.name||''}"/>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Unit / Size</label>
        <input class="form-input" id="f-unit" placeholder="e.g. 25KG, 1LT" value="${p?.unit||''}"/>
      </div>
      <div class="form-group">
        <label class="form-label">Quantity</label>
        <input class="form-input" id="f-qty" type="number" min="0" placeholder="0" value="${p?.qty||''}"/>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Buy Price (₹)</label>
        <input class="form-input" id="f-buy" type="number" min="0" placeholder="0" value="${p?.buyPrice||''}"/>
      </div>
      <div class="form-group">
        <label class="form-label">Sell Price (₹)</label>
        <input class="form-input" id="f-sell" type="number" min="0" placeholder="0" value="${p?.sellPrice||''}"/>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Expiry Date</label>
      <input class="form-input" id="f-expiry" type="date" value="${p?.expiry||''}"/>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-input form-textarea" id="f-desc" placeholder="What does this product do?">${p?.description||''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">How to Use</label>
      <textarea class="form-input form-textarea" id="f-use" placeholder="Dosage, application method...">${p?.howToUse||''}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary"   onclick="saveProduct('${p?.id||''}')">Save</button>
    </div>
  `;
}

function saveProduct(id) {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { showToast('Product name is required', 'err'); return; }

  const s = getState();
  const product = {
    id:          id || uid(),
    company:     document.getElementById('f-company').value,
    name:        name.toUpperCase(),
    unit:        document.getElementById('f-unit').value.trim().toUpperCase(),
    qty:         parseInt(document.getElementById('f-qty').value) || 0,
    buyPrice:    parseFloat(document.getElementById('f-buy').value) || 0,
    sellPrice:   parseFloat(document.getElementById('f-sell').value) || 0,
    expiry:      document.getElementById('f-expiry').value || '',
    description: document.getElementById('f-desc').value.trim(),
    howToUse:    document.getElementById('f-use').value.trim(),
  };

  if (id) {
    const idx = s.inventory.findIndex(x => x.id === id);
    if (idx >= 0) s.inventory[idx] = product;
  } else {
    s.inventory.push(product);
  }

  saveLocal();
  closeModal();
  showToast(id ? 'Product updated' : 'Product added', 'ok');
  renderInventory();
}

function confirmDeleteProduct(id) {
  const p = getState().inventory.find(x => x.id === id);
  showModal(`
    <div class="modal-header">
      <div class="modal-title">Delete Product</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="confirm-msg">Delete <b>${p.name} ${p.unit}</b>? This cannot be undone.</div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-danger"    onclick="deleteProduct('${id}')">Delete</button>
    </div>
  `);
}

function deleteProduct(id) {
  const s = getState();
  s.inventory = s.inventory.filter(x => x.id !== id);
  saveLocal();
  closeModal();
  showToast('Product deleted', 'ok');
  renderInventory();
}
