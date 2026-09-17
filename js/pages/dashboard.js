// ── DASHBOARD ─────────────────────────────────────────────────────────────
function renderDashboard() {
  const s    = getState();
  const inv  = s.inventory;
  const threshold = s.settings.lowStockThreshold;
  const today = todayStr();

  const totalProducts  = inv.length;
  const lowStock       = inv.filter(p => p.qty <= threshold);
  const expiringItems  = inv.filter(p => { const d = daysUntil(p.expiry); return d !== null && d <= 30 && d >= 0; });
  const expiredItems   = inv.filter(p => { const d = daysUntil(p.expiry); return d !== null && d < 0; });
  const todaySales     = s.sales.filter(s => s.date === today);
  const todayTotal     = todaySales.reduce((a, s) => a + (s.total || 0), 0);
  const todayPurchases = s.purchases.filter(p => p.date === today);
  const outstandingDebits = (s.debits || []).filter(d => d.paid < d.total);
  const totalDebit     = outstandingDebits.reduce((a, d) => a + (d.total - d.paid), 0);

  const companyMap = {};
  inv.forEach(p => {
    if (!companyMap[p.company]) companyMap[p.company] = [];
    companyMap[p.company].push(p);
  });

  document.getElementById('app-content').innerHTML = `
    <div class="page-title">Dashboard</div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-val">${totalProducts}</div>
        <div class="stat-lbl">Total Products</div>
      </div>
      <div class="stat-card">
        <div class="stat-val blue">${s.companies.length}</div>
        <div class="stat-lbl">Companies</div>
      </div>
      <div class="stat-card">
        <div class="stat-val green">${todaySales.length}</div>
        <div class="stat-lbl">Today's Sales</div>
      </div>
      <div class="stat-card">
        <div class="stat-val amber">${fmtCurrency(todayTotal)}</div>
        <div class="stat-lbl">Today's Revenue</div>
      </div>
    </div>

    <div class="dash-cards">

      ${lowStock.length > 0 ? `
      <div class="dash-card red" onclick="showLowStockModal()">
        <div class="dash-card-icon">⚠</div>
        <div class="dash-card-body">
          <div class="dash-card-title">Low Stock</div>
          <div class="dash-card-sub">${lowStock.length} product${lowStock.length > 1 ? 's' : ''} running low</div>
        </div>
        <div class="dash-card-arrow">›</div>
      </div>` : ''}

      ${expiredItems.length > 0 ? `
      <div class="dash-card red" onclick="showExpiredModal()">
        <div class="dash-card-icon">🚫</div>
        <div class="dash-card-body">
          <div class="dash-card-title">Expired Items</div>
          <div class="dash-card-sub">${expiredItems.length} product${expiredItems.length > 1 ? 's' : ''} expired</div>
        </div>
        <div class="dash-card-arrow">›</div>
      </div>` : ''}

      ${expiringItems.length > 0 ? `
      <div class="dash-card amber" onclick="showExpiringModal()">
        <div class="dash-card-icon">⏳</div>
        <div class="dash-card-body">
          <div class="dash-card-title">Expiring Soon</div>
          <div class="dash-card-sub">${expiringItems.length} product${expiringItems.length > 1 ? 's' : ''} within 30 days</div>
        </div>
        <div class="dash-card-arrow">›</div>
      </div>` : ''}

      ${outstandingDebits.length > 0 ? `
      <div class="dash-card amber" onclick="showDebitsModal()">
        <div class="dash-card-icon">📋</div>
        <div class="dash-card-body">
          <div class="dash-card-title">Outstanding Debits</div>
          <div class="dash-card-sub">${outstandingDebits.length} customer${outstandingDebits.length > 1 ? 's' : ''} · ${fmtCurrency(totalDebit)} due</div>
        </div>
        <div class="dash-card-arrow">›</div>
      </div>` : ''}

      <div class="dash-card blue" onclick="showCompanySummaryModal()">
        <div class="dash-card-icon">🏢</div>
        <div class="dash-card-body">
          <div class="dash-card-title">Company Summary</div>
          <div class="dash-card-sub">${Object.keys(companyMap).length} companies · ${totalProducts} products</div>
        </div>
        <div class="dash-card-arrow">›</div>
      </div>

    </div>

    ${todaySales.length > 0 ? `
    <div class="section-title">Today's Sales</div>
    <div class="history-list">
      ${todaySales.map(sale => `
        <div class="history-row">
          <div class="history-main">${sale.customer || 'Unknown Customer'}</div>
          <div class="history-meta">${sale.items.length} item${sale.items.length > 1 ? 's' : ''}</div>
          <div class="history-amount green">${fmtCurrency(sale.total)}</div>
        </div>`).join('')}
    </div>` : ''}

    ${todayPurchases.length > 0 ? `
    <div class="section-title">Today's Purchases</div>
    <div class="history-list">
      ${todayPurchases.map(p => `
        <div class="history-row">
          <div class="history-main">${p.company}</div>
          <div class="history-meta">${p.items.length} item${p.items.length > 1 ? 's' : ''}</div>
        </div>`).join('')}
    </div>` : ''}
  `;
}

// ── DASHBOARD MODALS ──────────────────────────────────────────────────────
function showLowStockModal() {
  const { inventory, settings } = getState();
  const items = inventory.filter(p => p.qty <= settings.lowStockThreshold);
  showModal(`
    <div class="modal-header">
      <div class="modal-title">⚠ Low Stock (${items.length})</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <table class="info-table">
      <thead><tr><th>Product</th><th>Unit</th><th>Qty</th></tr></thead>
      <tbody>
        ${items.map(p => `<tr><td>${p.name}</td><td>${p.unit}</td><td class="red">${p.qty}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showExpiredModal() {
  const items = getState().inventory.filter(p => { const d = daysUntil(p.expiry); return d !== null && d < 0; });
  showModal(`
    <div class="modal-header">
      <div class="modal-title">🚫 Expired Items (${items.length})</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <table class="info-table">
      <thead><tr><th>Product</th><th>Unit</th><th>Expired On</th></tr></thead>
      <tbody>
        ${items.map(p => `<tr><td>${p.name}</td><td>${p.unit}</td><td class="red">${fmtDate(p.expiry)}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showExpiringModal() {
  const items = getState().inventory.filter(p => { const d = daysUntil(p.expiry); return d !== null && d >= 0 && d <= 30; });
  showModal(`
    <div class="modal-header">
      <div class="modal-title">⏳ Expiring Soon (${items.length})</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <table class="info-table">
      <thead><tr><th>Product</th><th>Unit</th><th>Days Left</th></tr></thead>
      <tbody>
        ${items.map(p => `<tr><td>${p.name}</td><td>${p.unit}</td><td class="amber">${daysUntil(p.expiry)}d</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showCompanySummaryModal() {
  const { inventory } = getState();
  const companyMap = {};
  inventory.forEach(p => {
    if (!companyMap[p.company]) companyMap[p.company] = { count: 0, lowStock: 0 };
    companyMap[p.company].count++;
    if (p.qty <= getState().settings.lowStockThreshold) companyMap[p.company].lowStock++;
  });
  showModal(`
    <div class="modal-header">
      <div class="modal-title">🏢 Company Summary</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <table class="info-table">
      <thead><tr><th>Company</th><th>Products</th><th>Low Stock</th></tr></thead>
      <tbody>
        ${Object.entries(companyMap).map(([co, v]) => `
          <tr>
            <td>${co}</td>
            <td>${v.count}</td>
            <td class="${v.lowStock > 0 ? 'red' : 'green'}">${v.lowStock > 0 ? v.lowStock : '✓'}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showDebitsModal() {
  const debits = (getState().debits || []).filter(d => d.paid < d.total);
  showModal(`
    <div class="modal-header">
      <div class="modal-title">📋 Outstanding Debits</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <table class="info-table">
      <thead><tr><th>Customer</th><th>Due Date</th><th>Balance</th></tr></thead>
      <tbody>
        ${debits.map(d => `
          <tr>
            <td>${d.customer || '—'}</td>
            <td class="${d.dueDate && daysUntil(d.dueDate) < 0 ? 'red' : 'amber'}">${d.dueDate ? fmtDate(d.dueDate) : '—'}</td>
            <td class="amber">${fmtCurrency(d.total - d.paid)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}
