export function generateReceiptHTML(bill, txs = [], settings = {}) {

  // ─── Currency formatter: smart decimals ──────────────────────────────────────
  const fmt = (amount) => {
    const n = Number(amount) || 0
    return '₹' + (Number.isInteger(n)
      ? n.toLocaleString('en-IN')
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  }

  // ─── Date formatting ──────────────────────────────────────────────────────────
  const dateObj = new Date(bill.created_at)
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit'
  }).format(dateObj)
  const timeLabel = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  }).format(dateObj)

  // ─── Asset URLs ───────────────────────────────────────────────────────────────
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const logoSrc = baseUrl ? `${baseUrl}/logo_white.webp` : '/logo_white.webp'
  const watermarkSrc = baseUrl ? `${baseUrl}/favicon.ico` : '/favicon.ico'

  // ─── Totals ───────────────────────────────────────────────────────────────────
  const subtotal = bill.total_amount || txs.reduce((sum, t) => sum + t.cost, 0)
  const discountAmt = bill.discount || 0
  const taxAmt = bill.tax_amount || 0
  const finalTotal = subtotal - discountAmt + taxAmt
  const paidAmt = bill.paid_amount || 0
  const balance = bill.balance ?? Math.max(0, finalTotal - paidAmt)

  // ─── Patient ID: use real pid from DB ────────────────────────────────────────
  const patientIdDisplay = bill.patient_pid || bill.patient_ref || 'N/A'

  // ─── Payment display ──────────────────────────────────────────────────────────
  const payMethod = bill.payment_method
    ? bill.payment_method.charAt(0).toUpperCase() + bill.payment_method.slice(1)
    : 'Cash'
  const txnId = bill.transaction_id ||
    (bill.payment_method === 'cash' || !bill.payment_method ? 'Cash Payment' : 'N/A')

  // ─── Treatment rows ───────────────────────────────────────────────────────────
  const txsHtml = txs.length > 0
    ? txs.map((t, i) => `
        <tr>
          <td class="tx-num">${i + 1}</td>
          <td class="tx-desc">
            <span class="tx-name">${t.treatment_type}</span>
            ${t.tooth_numbers && t.tooth_numbers.length
              ? `<span class="tx-meta">Teeth: ${t.tooth_numbers.join(', ')}</span>` : ''}
            ${t.description ? `<span class="tx-meta">${t.description}</span>` : ''}
          </td>
          <td class="tx-cost">${fmt(t.cost)}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" class="tx-empty">No treatments recorded</td></tr>`

  // ─── SVG icons (beige #B19063) ────────────────────────────────────────────────
  const iconPhone = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B19063" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.34 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.44 5.44l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>`
  const iconGlobe = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B19063" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
  const iconMail = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B19063" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
  const iconPin = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B19063" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${bill.invoice_number || bill.id}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
<style>

/* ── Reset ─────────────────────────────────────────────────────────────── */
@page { size: A5 portrait; margin: 0; }
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  background: #d0d0d0;
  font-family: 'Inter', Arial, sans-serif;
  font-weight: 400;
  color: #222;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

@media print { html, body { background: white; } }

/* ── Page shell ─────────────────────────────────────────────────────────── */
.page {
  width: 148mm;
  height: 210mm;
  position: relative;
  overflow: hidden;
  background: white;
  margin: 0 auto;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.header {
  height: 28mm;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 7mm 0 5mm; /* point 1: push logo down slightly */
}

.logo-full {
  width: 60mm;
  height: auto;
  object-fit: contain;
}

/* ── Gold divider lines ──────────────────────────────────────────────────── */
.header-line, .footer-line { height: 2px; background: #B19063; }

/* ── Content area ────────────────────────────────────────────────────────── */
.content {
  position: relative;
  height: 154mm;
  padding: 4mm 10mm 4mm 10mm;
  overflow: hidden;
}

/* ── Watermark ───────────────────────────────────────────────────────────── */
.watermark {
  position: absolute;
  left: 50%; top: 56%; /* point 9: shift down so it doesn't overlap patient info */
  transform: translate(-50%, -50%);
  width: 90mm;
  opacity: 0.045;
  z-index: 0;
  pointer-events: none;
}

/* ── Invoice wrapper ─────────────────────────────────────────────────────── */
.invoice { position: relative; z-index: 10; }

/* ── Footer ──────────────────────────────────────────────────────────────── */
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  line-height: 1.6;
}

.footer-top {
  padding: 12px 30px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9pt;
  color: #000000ff;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.footer-bottom {
  text-align: center;
  font-size: 9pt;
  color: #000000ff;
  padding-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

/* ═══════════════════════════════════════
   INVOICE CONTENT
═══════════════════════════════════════ */

/* ── Invoice header ──────────────────────────────────────────────────────── */
.inv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.inv-header-left {
  display: flex;
  flex-direction: column;
}

.inv-title {
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #B19063; /* Beige accent */
  letter-spacing: 0.5px;
  line-height: 1;
  text-transform: uppercase;
}

.inv-subtitle {
  font-size: 9.5px;
  font-weight: 600;
  color: #777;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.inv-meta-grid {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.meta-lbl {
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #888;
  margin-bottom: 2px;
}

.meta-val {
  font-size: 11px;
  font-weight: 600;
  color: #222;
}

.meta-val.bold {
  font-size: 13.5px;
  font-weight: 700;
  color: #222;
}

.meta-val.time {
  font-size: 10px;
  font-weight: 500;
  color: #666;
}

.meta-divider {
  width: 1px;
  height: 20px;
  background: #E0E0E0;
}

/* ── Divider ─────────────────────────────────────────────────────────────── */
.divider { height: 1px; background: #D9D9D9; margin: 6px 0; }

/* ── Patient details — two-column label/value table ──────────────────────── */
.pat-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2px;
}

.pat-table td {
  padding: 3px 6px 3px 0;
  vertical-align: middle;
  font-size: 12px;
  line-height: 1.4;
}

.pat-table td.lbl {
  font-size: 9.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #777; /* point 12: darkened from #999 for print readability */
  white-space: nowrap;
  width: 85px;
  padding-right: 8px;
}

.pat-table td.val {
  font-size: 12px;
  font-weight: 600;
  color: #222;
}

.pat-table td:nth-child(3) {
  padding-left: 12px;
}

/* half-width columns for side-by-side pairs */
.pat-table td.lbl-half { width: 75px; }
.pat-table td.val-half { }

/* ── Treatment table ─────────────────────────────────────────────────────── */
.tx-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2px;
}

.tx-table thead tr { border-bottom: 1.5px solid #333; }

.tx-table thead th {
  padding: 6px 8px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: #222;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.tx-table thead th:first-child { width: 26px; text-align: center; }
.tx-table thead th:last-child  { text-align: right; padding-right: 18px; width: 72px; }

.tx-table tbody tr { border-bottom: 1px solid #E8E8E8; }
.tx-table tbody tr:last-child { border-bottom: none; }

.tx-table td {
  padding: 6px 8px;
  vertical-align: top;
  color: #222;
}

.tx-num { text-align: center; font-size: 11px; font-weight: 600; color: #666; }

.tx-name { display: block; font-size: 12px; font-weight: 600; color: #222; }

.tx-meta { display: block; font-size: 10px; color: #999; font-style: italic; margin-top: 2px; }

.tx-cost {
  text-align: right;
  padding-right: 18px;
  font-size: 12px;
  font-weight: 700;
  color: #222;
  white-space: nowrap;
}

.tx-empty { text-align: center; color: #bbb; padding: 14px 0; font-size: 11px; }

/* ── Totals ──────────────────────────────────────────────────────────────── */
.totals-wrap { display: flex; justify-content: flex-end; margin-top: 4px; }
.totals-box  { width: 44%; } /* point 5: 52%→44% for better balance */

.t-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 4px 0;
  font-size: 12px;
}

.t-row .t-lbl { font-weight: 500; color: #666; }

.t-row .t-val {
  font-weight: 600;
  color: #222;
  text-align: right;
  min-width: 72px;
  padding-right: 18px; /* point 11: consistent right margin across all amounts */
}

.t-row.final { border-top: 1.5px solid #222; margin-top: 4px; padding-top: 6px; }
.t-row.final .t-lbl { font-size: 13px; font-weight: 700; color: #222; }
.t-row.final .t-val { font-size: 17px; font-weight: 800; color: #222; }

.t-row.paid  .t-lbl { color: #222; font-weight: 600; }
.t-row.paid  .t-val { color: #222; font-weight: 700; }

.t-row.bal   .t-lbl { color: #c0392b; font-weight: 600; }
.t-row.bal   .t-val { color: #c0392b; font-weight: 700; }

/* ── Payment info — colon-aligned using table ────────────────────────────── */
/* point 7: labels and values start at exact same horizontal position */
.pay-info { font-size: 12px; margin-top: 4px; }
.pay-info table { border-collapse: collapse; }
.pay-info td { padding: 2px 0; vertical-align: top; }
.pay-info td.pi-lbl {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  padding-right: 6px;
  width: 130px; /* fixed so all values start at same x */
}
.pay-info td.pi-val { font-weight: 400; color: #555; }

</style>
</head>

<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <img class="logo-full" src="${logoSrc}" alt="Dr. Mahe's Dentistry">
  </div>
  <div class="header-line"></div>

  <!-- CONTENT -->
  <div class="content">
    <img class="watermark" src="${watermarkSrc}" alt="">

    <div class="invoice">

      <!-- Invoice header -->
      <div class="inv-header">
        <div class="inv-header-left">
          <div class="inv-title">Invoice</div>
          <div class="inv-subtitle">Patient Receipt &amp; Medical Bill</div>
        </div>
        <div class="inv-meta-grid">
          <div class="meta-block">
            <div class="meta-lbl">Invoice No</div>
            <div class="meta-val bold">${bill.invoice_number || bill.id}</div>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-block">
            <div class="meta-lbl">Date</div>
            <div class="meta-val">${dateLabel}</div>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-block">
            <div class="meta-lbl">Time</div>
            <div class="meta-val time">${timeLabel}</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Patient details — clean two-column table, no doctor -->
      <table class="pat-table">
        <tr>
          <td class="lbl">Patient Name</td>
          <td class="val">${bill.patient_name || '—'}</td>
          <td class="lbl">Patient ID</td>
          <td class="val">${patientIdDisplay}</td>
        </tr>
        <tr>
          <td class="lbl">Phone</td>
          <td class="val">${bill.phone || '—'}</td>
          <td class="lbl">Age / Gender</td>
          <td class="val">${bill.age || '—'} / ${bill.gender || '—'}</td>
        </tr>
      </table>

      <div class="divider"></div>

      <!-- Treatment table -->
      <table class="tx-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Treatment / Procedure</th>
            <th style="text-align:right; padding-right:18px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${txsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals-wrap">
        <div class="totals-box">
          <div class="t-row">
            <span class="t-lbl">Subtotal</span>
            <span class="t-val">${fmt(subtotal)}</span>
          </div>
          ${discountAmt > 0 ? `
          <div class="t-row">
            <span class="t-lbl">Discount</span>
            <span class="t-val" style="color:#1a7f45;">−${fmt(discountAmt)}</span>
          </div>` : ''}
          ${taxAmt > 0 ? `
          <div class="t-row">
            <span class="t-lbl">Tax / GST</span>
            <span class="t-val">+${fmt(taxAmt)}</span>
          </div>` : ''}
          <div class="t-row final">
            <span class="t-lbl">Total</span>
            <span class="t-val">${fmt(finalTotal)}</span>
          </div>
          <div class="t-row paid">
            <span class="t-lbl">Paid</span>
            <span class="t-val">${fmt(paidAmt)}</span>
          </div>
          ${balance > 0 ? `
          <div class="t-row bal">
            <span class="t-lbl">Balance Due</span>
            <span class="t-val">${fmt(balance)}</span>
          </div>` : `
          <div class="t-row" style="padding-top:3px;">
            <span class="t-lbl" style="color:#1a7f45;font-weight:600;">✓ Fully Settled</span>
            <span class="t-val" style="color:#1a7f45;font-size:11px;"> </span>
          </div>`}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Payment info — table layout for perfect colon alignment -->
      <div class="pay-info">
        <table>
          <tr>
            <td class="pi-lbl">Payment Method :</td>
            <td class="pi-val">${payMethod}</td>
          </tr>
          <tr>
            <td class="pi-lbl">Transaction ID :</td>
            <td class="pi-val">${txnId}</td>
          </tr>
        </table>
      </div>

    </div><!-- /invoice -->
  </div><!-- /content -->

  <!-- FOOTER with SVG icons in beige -->
  <div class="footer">
    <div class="footer-line"></div>
    <div class="footer-top">
      <div class="footer-item">${iconPhone} +91 9342803217</div>
      <div class="footer-item">${iconGlobe} drmahesdentistry.in</div>
      <div class="footer-item">${iconMail} smile@drmahesdentistry.in</div>
    </div>
    <div class="footer-bottom">
      ${iconPin} 1st Floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai - 600116
    </div>
  </div>

</div><!-- /page -->
</body>
</html>`
}