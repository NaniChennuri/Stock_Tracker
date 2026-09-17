// ── DEBITS (Outstanding Payments) ─────────────────────────────────────────
function renderDebits() {
  const b      = getActiveBranch();
  const all    = (b.debits || []).slice().reverse();
  const outstanding = all.filter(d => d.paid < d.total);
  const cleared     = all.filter(d => d.paid >= d.total);

  // split outstanding into overdue and upcoming
  const overdue  = outstanding.filter(d => d.dueDate && daysUntil(d.dueDate) < 0);
  const upcoming = outstanding.filter(d => !d.dueDate || daysUntil(d.dueDate) >= 0);

  const totalDue = outstanding.reduce((a, d) => a + (d.total - d.paid), 0);

  document.getElementById('app-content').innerHTML = `
    <div class="page-header"><div class="page-title">Debits</div></div>
    ${outstanding.length > 0 ? `<div class="filter-summary">Outstanding: <span class="amber">${fmtCurrency(totalDue)}</span> across ${outstanding.length} customer${outstanding.length>1?'s':''}</div>` : ''}

    ${outstanding.length === 0 && cleared.length === 0 ? `<div class="empty-msg">No debit records yet.</div>` : ''}

    ${overdue.length > 0 ? `
      <div class="section-title" style="color:var(--red)">⚠ Overdue (${overdue.length})</div>
      <div class="history-list">${overdue.map(d => debitCard(d)).join('')}</div>` : ''}

    ${upcoming.length > 0 ? `
      <div class="section-title">Outstanding (${upcoming.length})</div>
      <div class="history-list">${upcoming.map(d => debitCard(d)).join('')}</div>` : ''}

    ${cleared.length > 0 ? `
      <div class="section-title" style="margin-top:20px">Cleared (${cleared.length})</div>
      <div class="history-list">${cleared.map(d => debitCard(d, true)).join('')}</div>` : ''}
  `;
}

function debitCard(d, cleared = false) {
  const balance = d.total - d.paid;
  const overdue = d.dueDate && daysUntil(d.dueDate) < 0;
  return `
    <div class="history-card" onclick="openDebitDetail('${d.id}')">
      <div class="history-card-top">
        <span class="history-company">${d.customer || 'Unknown Customer'}</span>
        <span class="history-date">${fmtDate(d.date)}</span>
      </div>
      <div class="history-card-bottom">
        <span class="history-items-preview">
          ${d.dueDate ? `Due: <span class="${overdue?'red':'amber'}">${fmtDate(d.dueDate)}${overdue?' ⚠':''}</span>` : 'No due date'}
        </span>
        <span class="${cleared?'green':'amber'} history-total">${cleared ? '✓ Cleared' : fmtCurrency(balance)+' due'}</span>
      </div>
    </div>`;
}

function openDebitDetail(id) {
  const b = getActiveBranch();
  const d = (b.debits || []).find(x => x.id === id);
  if (!d) return;
  const balance = d.total - d.paid;
  const cleared = balance <= 0;
  const overdue = d.dueDate && daysUntil(d.dueDate) < 0;

  showModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">${d.customer || 'Unknown Customer'}</div>
        <div class="modal-sub">Sale date: ${fmtDate(d.date)}</div>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-lbl">Total</div><div class="detail-val">${fmtCurrency(d.total)}</div></div>
      <div class="detail-item"><div class="detail-lbl">Paid</div><div class="detail-val green">${fmtCurrency(d.paid)}</div></div>
      <div class="detail-item"><div class="detail-lbl">Balance</div><div class="detail-val ${cleared?'green':'amber'}">${fmtCurrency(balance)}</div></div>
      <div class="detail-item" style="grid-column:1/-1">
        <div class="detail-lbl">Due Date</div>
        <div class="detail-val ${overdue?'red':''}">${d.dueDate ? fmtDate(d.dueDate)+(overdue?' (Overdue)':'') : 'Not set'}</div>
      </div>
    </div>
    ${d.payments && d.payments.length > 0 ? `
      <div class="detail-sec-title" style="margin-bottom:6px">Payment History</div>
      <div class="detail-items">
        ${d.payments.map(p => `
          <div class="detail-item-row">
            <span>${fmtDate(p.date)}</span>
            <span class="green">${fmtCurrency(p.amount)}</span>
            ${p.note ? `<span class="history-meta">${p.note}</span>` : ''}
          </div>`).join('')}
      </div>` : ''}
    ${!cleared ? `
      <div class="form-group" style="margin-top:14px">
        <label class="form-label">Record Payment</label>
        <div class="form-row">
          <input class="form-input" id="pay-amount" type="number" min="1" placeholder="Amount ₹" max="${balance}"
            oninput="validatePayAmount(this, ${balance})"/>
          <input class="form-input" id="pay-note" placeholder="Note (optional)"/>
        </div>
        <div id="pay-amount-warn" style="font-size:12px;color:var(--amber);margin-top:4px;display:none">
          Amount exceeds balance of ${fmtCurrency(balance)} — will be capped.
        </div>
        <div style="margin-top:8px">
          <label class="form-label">Update Due Date (optional)</label>
          <input class="form-input" id="pay-duedate" type="date" value="${d.dueDate||''}"/>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal()">Close</button>
        <button class="btn-primary" onclick="recordDebitPayment('${id}')">Record Payment</button>
      </div>` : `
      <div class="modal-actions"><button class="btn-secondary" onclick="closeModal()">Close</button></div>`}
  `);
}

function validatePayAmount(input, balance) {
  const warn = document.getElementById('pay-amount-warn');
  if (warn) warn.style.display = parseFloat(input.value) > balance ? 'block' : 'none';
}

function recordDebitPayment(id) {
  const amount  = parseFloat(document.getElementById('pay-amount').value) || 0;
  if (amount <= 0) { showToast('Enter a valid amount', 'err'); return; }
  const note    = document.getElementById('pay-note').value.trim();
  const dueDate = document.getElementById('pay-duedate').value || '';
  const b       = getActiveBranch();
  if (!b.debits) b.debits = [];
  const d = b.debits.find(x => x.id === id);
  if (!d) return;
  const paying = Math.min(amount, d.total - d.paid);
  d.paid += paying;
  if (dueDate) d.dueDate = dueDate;
  if (!d.payments) d.payments = [];
  d.payments.push({ date: todayStr(), amount: paying, note });
  saveLocal();
  showToast(d.paid >= d.total ? 'Fully paid! ✓' : `Payment of ${fmtCurrency(paying)} recorded`, 'ok');
  closeModal();
  renderDebits();
}
