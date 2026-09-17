// ── DASHBOARD ─────────────────────────────────────────────────────────────
function renderDashboard() {
  const s         = getState();
  const b         = getActiveBranch();
  const threshold = s.settings.lowStockThreshold;
  const today     = todayStr();

  const inv            = b.inventory;
  const lowStock       = inv.filter(p => p.qty <= threshold);
  const expiredItems   = inv.filter(p => { const d = daysUntil(p.expiry); return d !== null && d < 0; });
  const expiringItems  = inv.filter(p => { const d = daysUntil(p.expiry); return d !== null && d >= 0 && d <= 30; });
  const todaySales     = b.sales.filter(x => x.date === today);
  const todayTotal     = todaySales.reduce((a, x) => a + (x.total || 0), 0);
  const todayPurchases = b.purchases.filter(x => x.date === today);
  const outstandingDeb = (b.debits || []).filter(d => d.paid < d.total);
  const totalDebit     = outstandingDeb.reduce((a, d) => a + (d.total - d.paid), 0);

  const allSalesTotal   = s.branches.reduce((a, br) => a + br.sales.reduce((x, s) => x + (s.total||0), 0), 0);
  const allDebitTotal   = s.branches.reduce((a, br) => a + (br.debits||[]).filter(d => d.paid < d.total).reduce((x, d) => x + (d.total-d.paid), 0), 0);
  const allProductCount = s.branches.reduce((a, br) => a + br.inventory.length, 0);

  document.getElementById('app-content').innerHTML = `
    <div class="page-title">Dashboard — ${b.name}</div>

    <div class="stat-grid">
      <div class="stat-card"><div class="stat-val">${inv.length}</div><div class="stat-lbl">Products</div></div>
      <div class="stat-card"><div class="stat-val blue">${b.companies.length}</div><div class="stat-lbl">Companies</div></div>
      <div class="stat-card"><div class="stat-val green">${todaySales.length}</div><div class="stat-lbl">Today's Sales</div></div>
      <div class="stat-card"><div class="stat-val amber">${fmtCurrency(todayTotal)}</div><div class="stat-lbl">Today's Revenue</div></div>
      ${totalDebit > 0 ? `<div class="stat-card" style="cursor:pointer" onclick="showDebitsModal()"><div class="stat-val amber">${fmtCurrency(totalDebit)}</div><div class="stat-lbl">Outstanding Debit</div></div>` : ''}
    </div>

    <div class="dash-cards">
      ${lowStock.length > 0 ? `
      <div class="dash-card red" onclick="showLowStockModal()">
        <div class="dash-card-icon">⚠</div>
        <div class="dash-card-body"><div class="dash-card-title">Low Stock</div><div class="dash-card-sub">${lowStock.length} product${lowStock.length>1?'s':''} running low</div></div>
        <div class="dash-card-arrow">›</div>
      </div>` : ''}

      ${expiredItems.length > 0 ? `
      <div class="dash-card red" onclick="showExpiredModal()">
        <div class="dash-card-icon">🚫</div>
        <div class="dash-card-body"><div class="dash-card-title">Expired Items</div><div class="dash-card-sub">${expiredItems.length} product${expiredItems.length>1?'s':''} expired</div></div>
        <div class="dash-card-arrow">›</div>
      </div>` : ''}

      ${expiringItems.length > 0 ? `
      <div class="dash-card amber" onclick="showExpiringModal()">
        <div class="dash-card-icon">⏳</div>
        <div class="dash-card-body"><div class="dash-card-title">Expiring Soon</div><div class="dash-card-sub">${expiringItems.length} product${expiringItems.length>1?'s':''} within 30 days</div></div>
        <div class="dash-card-arrow">›</div>
      </div>` : ''}

      ${outstandingDeb.length > 0 ? `
      <div class="dash-card amber" onclick="showDebitsModal()">
        <div class="dash-card-icon">📋</div>
        <div class="dash-card-body"><div class="dash-card-title">Outstanding Debits</div><div class="dash-card-sub">${outstandingDeb.length} customer${outstandingDeb.length>1?'s':''} · ${fmtCurrency(totalDebit)} due</div></div>
        <div class="dash-card-arrow">›</div>
      </div>` : ''}

      <div class="dash-card blue" onclick="showCompanySummaryModal()">
        <div class="dash-card-icon">🏢</div>
        <div class="dash-card-body"><div class="dash-card-title">Company Summary</div><div class="dash-card-sub">${b.companies.length} companies · ${inv.length} products</div></div>
        <div class="dash-card-arrow">›</div>
      </div>
    </div>

    ${s.branches.length > 1 ? `
    <div class="section-title">All Branches</div>
    <div class="dash-cards">
      ${s.branches.map(br => {
        const brRevenue = br.sales.reduce((a, x) => a + (x.total||0), 0);
        const brDebit   = (br.debits||[]).filter(d => d.paid < d.total).reduce((a, d) => a + (d.total-d.paid), 0);
        const brLow     = br.inventory.filter(p => p.qty <= threshold).length;
        const isActive  = br.id === b.id;
        return `
        <div class="dash-card ${isActive?'blue':''}" onclick="switchBranch('${br.id}')">
          <div class="dash-card-icon">🏪</div>
          <div class="dash-card-body">
            <div class="dash-card-title">${br.name}${isActive?' <span style="font-size:10px;opacity:0.7">(active)</span>':''}</div>
            <div class="dash-card-sub">${br.inventory.length} products · ${fmtCurrency(brRevenue)} revenue${brDebit>0?' · <span style="color:var(--amber)">'+fmtCurrency(brDebit)+' debit</span>':''}${brLow>0?' · <span style="color:var(--red)">'+brLow+' low</span>':''}</div>
          </div>
          <div class="dash-card-arrow">›</div>
        </div>`;
      }).join('')}
      <div class="dash-card" onclick="showCombinedModal()">
        <div class="dash-card-icon">📊</div>
        <div class="dash-card-body">
          <div class="dash-card-title">Combined</div>
          <div class="dash-card-sub">${allProductCount} products · ${fmtCurrency(allSalesTotal)} revenue · ${fmtCurrency(allDebitTotal)} debit</div>
        </div>
        <div class="dash-card-arrow">›</div>
      </div>
    </div>` : ''}

    ${todaySales.length > 0 ? `
    <div class="section-title">Today's Sales</div>
    <div class="history-list">
      ${todaySales.map(sale => `
        <div class="history-row">
          <div class="history-main">${sale.customer || 'Unknown Customer'}</div>
          <div class="history-meta">${sale.items.length} item${sale.items.length>1?'s':''}</div>
          <div class="history-amount green">${fmtCurrency(sale.total)}</div>
        </div>`).join('')}
    </div>` : ''}

    ${todayPurchases.length > 0 ? `
    <div class="section-title">Today's Purchases</div>
    <div class="history-list">
      ${todayPurchases.map(p => {
        const ptotal = p.items.reduce((a,i) => a + (i.qty * (i.buyPrice||0)), 0);
        return `
        <div class="history-row">
          <div class="history-main">${p.company}</div>
          <div class="history-meta">${p.items.length} item${p.items.length>1?'s':''}</div>
          <div class="history-amount blue">${ptotal > 0 ? fmtCurrency(ptotal) : '—'}</div>
        </div>`;
      }).join('')}
    </div>` : ''}
  `;
}

// ── DASHBOARD MODALS ──────────────────────────────────────────────────────
function showLowStockModal() {
  const items = getActiveBranch().inventory.filter(p => p.qty <= getState().settings.lowStockThreshold);
  showModal(`
    <div class="modal-header"><div class="modal-title">⚠ Low Stock (${items.length})</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <table class="info-table">
      <thead><tr><th>Product</th><th>Unit</th><th>Qty</th></tr></thead>
      <tbody>${items.map(p => `<tr><td>${p.name}</td><td>${p.unit}</td><td class="red">${p.qty}</td></tr>`).join('')}</tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showExpiredModal() {
  const items = getActiveBranch().inventory.filter(p => { const d = daysUntil(p.expiry); return d !== null && d < 0; });
  showModal(`
    <div class="modal-header"><div class="modal-title">🚫 Expired (${items.length})</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <table class="info-table">
      <thead><tr><th>Product</th><th>Unit</th><th>Expired On</th></tr></thead>
      <tbody>${items.map(p => `<tr><td>${p.name}</td><td>${p.unit}</td><td class="red">${fmtDate(p.expiry)}</td></tr>`).join('')}</tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showExpiringModal() {
  const items = getActiveBranch().inventory.filter(p => { const d = daysUntil(p.expiry); return d !== null && d >= 0 && d <= 30; });
  showModal(`
    <div class="modal-header"><div class="modal-title">⏳ Expiring Soon (${items.length})</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <table class="info-table">
      <thead><tr><th>Product</th><th>Unit</th><th>Days Left</th></tr></thead>
      <tbody>${items.map(p => `<tr><td>${p.name}</td><td>${p.unit}</td><td class="amber">${daysUntil(p.expiry)}d</td></tr>`).join('')}</tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showCompanySummaryModal() {
  const b = getActiveBranch();
  const threshold = getState().settings.lowStockThreshold;
  const map = {};
  b.inventory.forEach(p => {
    if (!map[p.company]) map[p.company] = { count:0, lowStock:0 };
    map[p.company].count++;
    if (p.qty <= threshold) map[p.company].lowStock++;
  });
  showModal(`
    <div class="modal-header"><div class="modal-title">🏢 Company Summary — ${b.name}</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <table class="info-table">
      <thead><tr><th>Company</th><th>Products</th><th>Low Stock</th></tr></thead>
      <tbody>${Object.entries(map).map(([co, v]) => `
        <tr><td>${co}</td><td>${v.count}</td><td class="${v.lowStock>0?'red':'green'}">${v.lowStock>0?v.lowStock:'✓'}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showDebitsModal() {
  const debits = (getActiveBranch().debits || []).filter(d => d.paid < d.total);
  showModal(`
    <div class="modal-header"><div class="modal-title">📋 Outstanding Debits</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <table class="info-table">
      <thead><tr><th>Customer</th><th>Due Date</th><th>Balance</th></tr></thead>
      <tbody>${debits.map(d => `
        <tr>
          <td>${d.customer||'—'}</td>
          <td class="${d.dueDate && daysUntil(d.dueDate)<0?'red':'amber'}">${d.dueDate?fmtDate(d.dueDate):'—'}</td>
          <td class="amber">${fmtCurrency(d.total-d.paid)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}

function showCombinedModal() {
  const s = getState();
  const threshold = s.settings.lowStockThreshold;
  showModal(`
    <div class="modal-header"><div class="modal-title">📊 Combined — All Branches</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <table class="info-table">
      <thead><tr><th>Branch</th><th>Products</th><th>Revenue</th><th>Debit</th><th>Low Stock</th></tr></thead>
      <tbody>${s.branches.map(br => {
        const rev  = br.sales.reduce((a, x) => a + (x.total||0), 0);
        const deb  = (br.debits||[]).filter(d => d.paid < d.total).reduce((a, d) => a + (d.total-d.paid), 0);
        const low  = br.inventory.filter(p => p.qty <= threshold).length;
        return `<tr>
          <td>${br.name}</td>
          <td>${br.inventory.length}</td>
          <td class="green">${fmtCurrency(rev)}</td>
          <td class="${deb>0?'amber':''}">${deb>0?fmtCurrency(deb):'—'}</td>
          <td class="${low>0?'red':'green'}">${low>0?low:'✓'}</td>
        </tr>`;
      }).join('')}</tbody>
    </table>
    <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>
  `);
}
