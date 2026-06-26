export function generateReceiptHTML(bill, txs = [], settings = {}) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2
  })

  const dFormat = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(bill.created_at))

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const letterheadSrc = baseUrl ? `${baseUrl}/${encodeURI('Letter Head.png')}` : '/Letter%20Head.png'

  // Calculate totals
  const subtotal = bill.total_amount || txs.reduce((sum, t) => sum + t.cost, 0)
  const discountAmount = bill.discount || 0
  const taxAmount = bill.tax_amount || 0
  const finalTotal = (subtotal - discountAmount + taxAmount)
  const balance = bill.balance || (finalTotal - (bill.paid_amount || 0))

  const txsHtml = txs.map((t, index) => `
    <tr>
      <td class="tx-number">${index + 1}</td>
      <td class="tx-description">
        <strong>${t.treatment_type}</strong>
        ${t.tooth_numbers && t.tooth_numbers.length ? `<br><small>Teeth: ${t.tooth_numbers.join(', ')}</small>` : ''}
        ${t.description ? `<br><small>${t.description}</small>` : ''}
      </td>
      <td class="tx-cost">${formatter.format(t.cost)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${bill.invoice_number || bill.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
        }

        @page {
          size: A5 portrait;
          margin: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          color: #333;
          line-height: 1.45;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        .invoice {
          width: 148mm;
          height: 210mm;
          position: relative;
          background: #fff;
          margin: 0 auto;
          overflow: hidden;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .letterhead-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 148mm;
          height: 210mm;
          object-fit: cover;
          z-index: 0;
          opacity: 1;
        }

        /* Content area - only the white writable space */
        .invoice-content {
          position: absolute;
          top: 35mm;
          left: 12mm;
          right: 12mm;
          bottom: 30mm;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: transparent;
          z-index: 1;
        }

        /* Invoice header section */
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 8px;
          border-bottom: 1px solid #ddd;
          margin-bottom: 10px;
          flex-shrink: 0;
        }

        .invoice-header-left h2 {
          font-size: 20px;
          font-weight: 700;
          color: #121212;
          margin-bottom: 4px;
        }

        .invoice-header-left p {
          font-size: 13px;
          color: #444;
        }

        .invoice-header-right {
          text-align: right;
        }

        .invoice-header-right .label {
          font-size: 10px;
          text-transform: uppercase;
          color: #444;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .invoice-header-right .value {
          font-size: 16px;
          font-weight: 700;
          color: #121212;
        }

        /* Patient info section */
        .patient-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 8px 0;
          margin-bottom: 10px;
          flex-shrink: 0;
          font-size: 11px;
        }

        .patient-info-item {
          display: flex;
          flex-direction: column;
        }

        .patient-info-item label {
          font-size: 9px;
          text-transform: uppercase;
          color: #444;
          font-weight: 700;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }

        .patient-info-item span {
          font-size: 11px;
          color: #222;
          font-weight: 700;
        }

        /* Treatment table */
        .treatments-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          margin-bottom: 10px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          flex: 1;
        }

        thead {
          background: #f8f8f8;
        }

        thead tr {
          border-bottom: 1px solid #333;
        }

        thead th {
          padding: 5px 4px;
          text-align: left;
          font-weight: 700;
          color: #121212;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.35px;
        }

        thead th:first-child {
          width: 20px;
        }

        thead th:last-child {
          text-align: right;
          width: 45px;
        }

        tbody tr {
          border-bottom: 1px solid #eee;
        }

        tbody tr:last-child {
          border-bottom: none;
        }

        td {
          padding: 4px 4px;
          vertical-align: top;
          color: #333;
        }

        .tx-number {
          text-align: center;
          font-weight: 700;
          color: #121212;
          font-size: 10px;
        }

        .tx-description {
          font-size: 10px;
          color: #333;
        }

        .tx-description strong {
          font-weight: 700;
          color: #121212;
          display: block;
          font-size: 10px;
        }

        .tx-description small {
          display: block;
          font-size: 9px;
          color: #555;
          margin-top: 1px;
          font-style: italic;
        }

        .tx-cost {
          text-align: right;
          font-weight: 700;
          color: #121212;
          font-size: 10px;
          width: 45px;
        }

        /* Totals section */
        .totals {
          display: flex;
          justify-content: flex-end;
          padding: 7px 0;
          margin-bottom: 10px;
          flex-shrink: 0;
          font-size: 10px;
        }

        .totals-box {
          width: 48%;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 10px;
          color: #333;
          border-bottom: none;
        }

        .total-row label {
          font-weight: 700;
          color: #333;
        }

        .total-row.final {
          border-top: 1px solid #121212;
          padding-top: 5px;
          margin-top: 3px;
          font-weight: 800;
          font-size: 11px;
          color: #121212;
        }

        .total-row.paid {
          color: #2e7d32;
          font-weight: 700;
        }

        .total-row.balance {
          color: #d32f2f;
          font-weight: 700;
        }

        /* Payment info section */
        .payment-info {
          display: flex;
          justify-content: space-between;
          padding: 7px 0;
          margin-bottom: 10px;
          flex-shrink: 0;
          font-size: 10px;
          border-bottom: 1px solid #ddd;
        }

        .payment-info div {
          flex: 1;
        }

        .payment-info label {
          font-weight: 700;
          color: #333;
          font-size: 10px;
        }

        .payment-info span {
          font-size: 10px;
          color: #333;
          margin-left: 4px;
        }

        /* Signature section */
        .signature-area {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding-top: 6px;
          flex-shrink: 0;
        }

        .signature-box {
          flex: 1;
          text-align: center;
          font-size: 9px;
        }

        .signature-line {
          height: 24px;
          border-top: 1px solid #333;
          margin-bottom: 3px;
        }

        .signature-box span {
          display: block;
          font-size: 9px;
          color: #333;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .invoice {
            width: 100%;
            height: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <img class="letterhead-bg" src="${letterheadSrc}" alt="Letterhead">
        <div class="invoice-content">
          
          <!-- Invoice Header with Number & Date -->
          <div class="invoice-header">
            <div class="invoice-header-left">
              <h2>Invoice</h2>
              <p>Patient Receipt & Bill</p>
            </div>
            <div class="invoice-header-right">
              <div class="label">Invoice No</div>
              <div class="value">${bill.invoice_number || bill.id}</div>
              <div class="label" style="margin-top: 2px;">Date</div>
              <div class="value">${dFormat}</div>
            </div>
          </div>

          <!-- Patient Information -->
          <div class="patient-info">
            <div class="patient-info-item">
              <label>Patient Name</label>
              <span>${bill.patient_name || '-'}</span>
            </div>
            <div class="patient-info-item">
              <label>Patient ID</label>
              <span>${bill.patient_id || '-'}</span>
            </div>
            <div class="patient-info-item">
              <label>Age / Gender</label>
              <span>${bill.age || '-'} / ${bill.gender || '-'}</span>
            </div>
            <div class="patient-info-item">
              <label>Phone</label>
              <span>${bill.phone || '-'}</span>
            </div>
            <div class="patient-info-item">
              <label>Doctor</label>
              <span>${bill.doctor_name || '-'}</span>
            </div>
            <div class="patient-info-item">
              <label>Visit Date</label>
              <span>${dFormat.split(',')[0]}</span>
            </div>
          </div>

          <!-- Treatment Table -->
          <div class="treatments-section">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Treatment</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${txsHtml}
              </tbody>
            </table>
          </div>

          <!-- Bill Totals -->
          <div class="totals">
            <div class="totals-box">
              <div class="total-row">
                <label>Subtotal:</label>
                <span>${formatter.format(subtotal)}</span>
              </div>
              ${discountAmount > 0 ? `
                <div class="total-row">
                  <label>Discount:</label>
                  <span>−${formatter.format(discountAmount)}</span>
                </div>
              ` : ''}
              ${taxAmount > 0 ? `
                <div class="total-row">
                  <label>Tax:</label>
                  <span>+${formatter.format(taxAmount)}</span>
                </div>
              ` : ''}
              <div class="total-row final">
                <label>Total:</label>
                <span>${formatter.format(finalTotal)}</span>
              </div>
              <div class="total-row paid">
                <label>Paid:</label>
                <span>${formatter.format(bill.paid_amount || 0)}</span>
              </div>
              ${balance > 0 ? `
                <div class="total-row balance">
                  <label>Balance Due:</label>
                  <span>${formatter.format(balance)}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Payment Information -->
          <div class="payment-info">
            <div>
              <label>Payment Method:</label>
              <span>${bill.payment_method ? bill.payment_method.charAt(0).toUpperCase() + bill.payment_method.slice(1) : 'Cash'}</span>
            </div>
            <div>
              <label>Transaction ID:</label>
              <span>${bill.transaction_id || '-'}</span>
            </div>
          </div>

          <!-- Signature Area -->
          <div class="signature-area">
            <div class="signature-box">
              <div class="signature-line"></div>
              <span>Patient Signature</span>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <span>Authorized Signature</span>
            </div>
          </div>

        </div>
      </div>
    </body>
    </html>
  `
}