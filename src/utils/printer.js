export function generateReceiptHTML(bill, txs = [], settings = {}) {
  const clinicName = settings.clinic_name || "Dr. Mahe's Dentistry"
  const clinicAddress = settings.clinic_address || "1st Floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai - 600116"
  const clinicPhone = settings.clinic_phone || "+91 9342803217"
  const clinicEmail = settings.clinic_email || "smile@drmahesdentistry.in"
  const logoUrl = settings.logo_url || null
  
  const dFormat = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(bill.created_at))

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2
  })

  // Calculate totals
  const subtotal = bill.total_amount || txs.reduce((sum, t) => sum + t.cost, 0)
  const discountAmount = subtotal * (bill.discount || 0) / 100
  const taxAmount = (subtotal - discountAmount) * (bill.tax_percent || 0) / 100
  const finalTotal = subtotal - discountAmount + taxAmount
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

  const logoSection = logoUrl ? `
    <img src="${logoUrl}" alt="${clinicName}" class="clinic-logo">
  ` : ''

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${bill.invoice_number || bill.id}</title>
      <style>
        :root {
          --black: #121212;
          --beige: #D8C3A5;
          --light: #F7F2EC;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          color: #2c3e50;
          padding: 0;
          line-height: 1.4;
        }

        @page {
          size: A5;
          margin: 0;
        }

        @media print {
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          .invoice-container {
            box-shadow: none;
            border-radius: 0;
            max-width: 100%;
            margin: 0;
            padding: 0;
            height: 100vh;
          }
        }

        .invoice-container {
          background: white;
          width: 148mm;
          height: 210mm;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          padding: 0;
          box-sizing: border-box;
        }

        /* Premium Header */
        .header {
          background: var(--black);
          color: white;
          padding: 12px;
          margin: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border: none;
        }

        .header-left {
          display: flex;
          gap: 8px;
          align-items: center;
          flex: 1;
        }

        .clinic-logo {
          height: 40px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .clinic-name {
          color: var(--beige);
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .invoice-section {
          text-align: right;
          font-size: 8px;
          color: var(--beige);
        }

        .invoice-label {
          font-size: 6px;
          text-transform: uppercase;
          color: var(--beige);
          letter-spacing: 1px;
          margin-bottom: 1px;
          opacity: 0.8;
        }

        .invoice-number {
          font-size: 14px;
          font-weight: 700;
          color: var(--beige);
          margin-bottom: 4px;
        }

        .invoice-meta {
          font-size: 7px;
          color: rgba(255,255,255,0.8);
          line-height: 1.3;
        }

        /* Clinic Details */
        .clinic-details {
          font-size: 7px;
          color: #666;
          line-height: 1.4;
          padding: 8px 12px;
          background: var(--light);
          margin: 0;
        }

        .clinic-details span {
          display: block;
          margin-bottom: 1px;
        }

        /* Patient Card */
        .patient-card {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 8px 12px;
          border-bottom: 1px solid #e0e0e0;
          margin: 0;
        }

        .patient-card > div {
          display: flex;
          flex-direction: column;
        }

        .patient-card label {
          font-size: 6px;
          text-transform: uppercase;
          color: var(--black);
          letter-spacing: 0.7px;
          font-weight: 700;
          margin-bottom: 2px;
          opacity: 0.7;
        }

        .patient-card span {
          font-size: 8px;
          color: var(--black);
          font-weight: 500;
        }

        /* Services Table */
        .services {
          padding: 8px 12px;
          flex: 1;
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8px;
          margin-bottom: 8px;
        }

        thead tr {
          background: var(--light);
          border-bottom: 2px solid var(--black);
        }

        thead th {
          padding: 4px 3px;
          text-align: left;
          font-weight: 700;
          color: var(--black);
          font-size: 7px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        thead th:first-child {
          width: 20px;
        }

        tbody tr {
          border-bottom: 1px solid #f0f0f0;
        }

        tbody tr:last-child {
          border-bottom: none;
        }

        td {
          padding: 4px 3px;
          color: #2c3e50;
          vertical-align: top;
        }

        .tx-number {
          text-align: center;
          font-weight: 600;
          color: var(--black);
        }

        .tx-description {
          width: 60%;
        }

        .tx-description strong {
          font-weight: 600;
          color: var(--black);
          font-size: 8px;
        }

        .tx-description small {
          display: block;
          font-size: 7px;
          color: #666;
          margin-top: 1px;
          font-style: italic;
        }

        .tx-cost {
          text-align: right;
          font-weight: 700;
          color: var(--black);
          font-size: 8px;
        }

        /* Totals */
        .totals-section {
          padding: 0 12px 8px 12px;
          border-top: 1px solid #e0e0e0;
        }

        .totals-box {
          margin-left: auto;
          width: 55%;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 7px;
          padding: 3px 0;
          color: #2c3e50;
        }

        .total-row strong {
          font-weight: 700;
          color: var(--black);
        }

        .total-row.highlight {
          background: var(--light);
          padding: 3px 4px;
          margin: 2px -4px;
          border-radius: 2px;
        }

        .total-row.final {
          font-size: 9px;
          font-weight: 700;
          color: var(--black);
          padding: 5px 0;
          margin-top: 3px;
          border-top: 2px solid var(--black);
        }

        .amount {
          font-weight: 700;
          font-size: 7px;
        }

        .amount-green {
          color: #2e7d32;
        }

        .amount-red {
          color: #d32f2f;
        }

        /* Payment Info */
        .payment-info {
          padding: 8px 12px;
          background: var(--light);
          font-size: 7px;
          color: var(--black);
          line-height: 1.5;
          border-bottom: 1px solid #e0e0e0;
        }

        .payment-info > div {
          margin-bottom: 2px;
        }

        .payment-info strong {
          font-weight: 600;
          color: var(--black);
        }

        /* Signature Row */
        .signature-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          gap: 20px;
          margin-bottom: 0;
        }

        .signature-row > div {
          flex: 1;
          text-align: center;
          font-size: 7px;
        }

        .signature-line {
          height: 30px;
          border-top: 1px solid var(--black);
          margin-bottom: 3px;
        }

        /* Footer */
        .footer {
          text-align: center;
          font-size: 8px;
          color: var(--black);
          padding: 6px 12px;
          border-top: 1px solid #e0e0e0;
          line-height: 1.4;
          margin-top: auto;
        }

        .footer strong {
          display: block;
          margin-bottom: 2px;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .invoice-container {
            width: 100%;
            height: auto;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        
        <!-- Premium Header -->
        <div class="header">
          <div class="header-left">
            ${logoSection}
            <div class="clinic-name">${clinicName}</div>
          </div>
          <div class="invoice-section">
            <div class="invoice-label">Invoice</div>
            <div class="invoice-number">${bill.invoice_number || bill.id}</div>
            <div class="invoice-meta">${dFormat}</div>
          </div>
        </div>

        <!-- Clinic Details -->
        <div class="clinic-details">
          <span>${clinicAddress}</span>
          <span>${clinicPhone} | ${clinicEmail}</span>
        </div>

        <!-- Patient Card -->
        <div class="patient-card">
          <div>
            <label>Patient Name</label>
            <span>${bill.patient_name || '-'}</span>
          </div>
          <div>
            <label>Patient ID</label>
            <span>${bill.patient_id || '-'}</span>
          </div>
          <div>
            <label>Age / Gender</label>
            <span>${bill.age || '-'} / ${bill.gender || '-'}</span>
          </div>
          <div>
            <label>Phone</label>
            <span>${bill.phone || '-'}</span>
          </div>
          <div>
            <label>Doctor</label>
            <span>${bill.doctor_name || 'Dr. Maheswari'}</span>
          </div>
          <div>
            <label>Date</label>
            <span>${dFormat}</span>
          </div>
        </div>

        <!-- Services Table -->
        <div class="services">
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

          <!-- Totals -->
          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row highlight">
                <strong>Subtotal</strong>
                <span class="amount">${formatter.format(subtotal)}</span>
              </div>
              ${bill.discount > 0 ? `
                <div class="total-row highlight">
                  <strong>Discount (${bill.discount}%)</strong>
                  <span class="amount amount-green">−${formatter.format(discountAmount)}</span>
                </div>
              ` : ''}
              ${bill.tax_percent > 0 ? `
                <div class="total-row highlight">
                  <strong>Tax (${bill.tax_percent}%)</strong>
                  <span class="amount amount-red">+${formatter.format(taxAmount)}</span>
                </div>
              ` : ''}
              <div class="total-row final">
                <strong>Total Amount</strong>
                <span>${formatter.format(finalTotal)}</span>
              </div>
              <div class="total-row">
                <strong>Amount Paid</strong>
                <span class="amount">${formatter.format(bill.paid_amount || 0)}</span>
              </div>
              <div class="total-row" style="${balance > 0 ? 'color: #d32f2f; font-weight: 700;' : 'color: #2e7d32; font-weight: 700;'}">
                <strong>Balance Due</strong>
                <span class="amount">${formatter.format(balance)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="payment-info">
          <div><strong>Payment Method:</strong> ${bill.payment_method || 'Cash'}</div>
          <div><strong>Transaction ID:</strong> ${bill.transaction_id || '-'}</div>
        </div>

        <!-- Signature Section -->
        <div class="signature-row">
          <div>
            <div class="signature-line"></div>
            Patient Signature
          </div>
          <div>
            <div class="signature-line"></div>
            Authorized Signature
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <strong>Thank You For Choosing Dr. Mahe's Dentistry</strong>
          <br>
          Please retain this invoice for future reference.
        </div>

      </div>
    </body>
    </html>
  `
}