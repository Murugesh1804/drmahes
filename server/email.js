const nodemailer = require('nodemailer')
const path = require('path')

// Initialize transporter using SMTP config from env variables
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
const smtpUser = process.env.SMTP_USER || ''
const smtpPass = process.env.SMTP_PASS || ''
const mailFrom = process.env.MAIL_FROM || ''

if (process.env.NODE_ENV === 'production' && (!mailFrom || !smtpUser || !smtpPass)) {
  throw new Error('[email] MAIL_FROM, SMTP_USER, and SMTP_PASS must be configured in production')
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
})

/**
 * Sends a highly styled HTML confirmation email to the patient.
 * 
 * @param {string} toEmail 
 * @param {string} patientName 
 * @param {string} date YYYY-MM-DD
 * @param {string} timeSlot e.g. "10:00 AM"
 * @param {string} service e.g. "Checkup"
 */
async function sendAppointmentConfirmation(toEmail, patientName, date, timeSlot, service) {
  if (!toEmail) return

  // Format date nicely (e.g., "Saturday, 6 June 2026")
  const dateFormatted = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })


  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: toEmail.trim(),
    subject: "Thank You for Choosing Dr. Mahe's Dentistry!",
    html: `<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed - Dr. Mahe's Dentistry</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f0e8;
      margin: 0;
      padding: 0;
      color: #1a1209;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      padding: 40px 20px;
      width: 100%;
      box-sizing: border-box;
      background-color: #f5f0e8;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fffdf9;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #e8dfc8;
    }

    /* ── HEADER ── */
    .header {
      background-color: #1a1209;
      padding: 36px 40px;
      text-align: center;
    }
    .header img {
      height: 64px;
      width: auto;
      display: inline-block;
    }
    .gold-bar {
      height: 4px;
      background: linear-gradient(90deg, #c9a96e, #e8d5a3, #c9a96e);
    }

    /* ── BODY ── */
    .content {
      padding: 40px 36px;
      background-color: #fffdf9;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #1a1209;
      margin: 0 0 12px;
    }
    .intro-text {
      font-size: 15px;
      line-height: 1.7;
      color: #6b5c45;
      margin: 0 0 32px;
    }

    /* ── APPOINTMENT CARD ── */
    .card {
      background-color: #f9f4eb;
      border-radius: 16px;
      border: 1px solid #e0d0b0;
      border-left: 4px solid #c9a96e;
      padding: 28px;
      margin-bottom: 24px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 600;
      color: #9a7c50;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 22px;
    }
    .detail-item {
      margin-bottom: 18px;
    }
    .detail-item:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      font-size: 11px;
      color: #9a7c50;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin: 0 0 4px;
    }
    .detail-value {
      font-size: 16px;
      font-weight: 600;
      color: #1a1209;
      margin: 0;
    }

    /* ── TIP BOX ── */
    .tip-box {
      background-color: #fdf6e3;
      border: 1px solid #e8d5a3;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 28px;
      font-size: 14px;
      color: #6b5c45;
      line-height: 1.65;
    }
    .tip-box strong {
      color: #1a1209;
    }

    /* ── BUTTONS ── */
    .btn-row {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 12px 0;
      margin: 0 -12px;
    }
    .btn-cell {
      display: table-cell;
      width: 50%;
    }
    .btn {
      display: block;
      text-align: center;
      padding: 13px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      box-sizing: border-box;
    }
    .btn-light {
      background-color: #f9f4eb;
      border: 1px solid #e0d0b0;
      color: #1a1209;
    }
    .btn-dark {
      background-color: #1a1209;
      color: #e8d5a3;
    }

    /* ── FOOTER ── */
    .footer {
      background-color: #f2ebe0;
      padding: 28px 36px;
      border-top: 1px solid #e0d0b0;
      text-align: center;
    }
    .footer-name {
      font-size: 14px;
      font-weight: 600;
      color: #1a1209;
      margin: 0 0 8px;
    }
    .footer-address {
      font-size: 13px;
      color: #6b5c45;
      line-height: 1.8;
      margin: 0 0 10px;
    }
    .footer-contact {
      font-size: 13px;
      color: #6b5c45;
      margin: 0 0 20px;
    }
    .footer-contact a {
      color: #6b5c45;
      text-decoration: none;
    }
    .footer-disclaimer {
      font-size: 11px;
      color: #a8957a;
      padding-top: 16px;
      border-top: 1px solid #e0d0b0;
      margin: 0;
    }

    @media (max-width: 600px) {
      .wrapper        { padding: 20px 10px; }
      .header         { padding: 28px 24px; }
      .content        { padding: 32px 24px; }
      .card           { padding: 22px; }
      .footer         { padding: 24px 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">

      <!-- HEADER -->
      <div class="header">
        <!--
          LOGO: Inline CID attachment
        -->
        <img
          src="cid:logo_black"
          alt="Dr. Mahe's Dentistry"
        />
      </div>
      <div class="gold-bar"></div>

      <!-- BODY -->
      <div class="content">
        <p class="greeting">Hi ${patientName},</p>
        <p class="intro-text">
          Thank you for choosing Dr. Mahe's Dentistry. Your appointment is confirmed — here are your booking details.
        </p>

        <!-- APPOINTMENT CARD -->
        <div class="card">
          <p class="card-title">Appointment details</p>

          <div class="detail-item">
            <p class="detail-label">Date</p>
            <p class="detail-value">${dateFormatted}</p>
          </div>

          <div class="detail-item">
            <p class="detail-label">Time</p>
            <p class="detail-value">${timeSlot || 'Walk-in'}</p>
          </div>

          <div class="detail-item">
            <p class="detail-label">Service</p>
            <p class="detail-value">${service || 'General Consultation'}</p>
          </div>
        </div>

        <!-- TIP BOX -->
        <div class="tip-box">
          💡 <strong>Quick tip:</strong> Please arrive 10 minutes early to your appointment.
          Need to reschedule? Kindly let us know at least 24 hours in advance.
        </div>

        <!-- ACTION BUTTONS -->
        <div class="btn-row">
          <div class="btn-cell">
            <a href="tel:+919342803217" class="btn btn-light">📞 Call us</a>
          </div>
          <div class="btn-cell">
            <a
              href="https://maps.app.goo.gl/qk38zLE94teNnSub6"
              target="_blank"
              class="btn btn-dark"
            >📍 Get directions</a>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p class="footer-name">Dr. Mahe's Dentistry</p>
        <p class="footer-address">
          1st Floor, Kundrathur Main Rd, Jaya Nagar<br>
          Porur, Chennai – 600116
        </p>
        <p class="footer-contact">
          📞 <a href="tel:+919342803217">+91 93428 03217</a>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          💬 <a href="https://wa.me/919342803217">WhatsApp</a>
        </p>
        <p class="footer-disclaimer">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`,
    attachments: [
      {
        filename: 'logo_black.png',
        path: path.join(__dirname, '../website/public/assets/logo_black.png'),
        cid: 'logo_black'
      }
    ]
  }

  try {
    console.log(`[email] Sending booking confirmation to ${toEmail}...`)
    const info = await transporter.sendMail(mailOptions)
    console.log(`[email] Message sent successfully: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error(`[email] Failed to send email to ${toEmail}:`, err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Sends an invoice email to the patient.
 * @param {string} toEmail
 * @param {object} bill
 * @param {Array}  treatments
 */
async function sendInvoiceEmail(toEmail, bill, treatments = []) {
  if (!toEmail) return { success: false, error: 'No email provided' }

  const cur = '₹'
  const date = new Date(bill.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const rowsHtml = treatments.length > 0
    ? treatments.map((t, i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ece4;font-size:13px;color:#1a1209;">
          ${i + 1}. ${t.treatment_type}${t.tooth_number ? ` <span style="color:#9a7c50;font-size:11px;">(Tooth #${t.tooth_number})</span>` : ''}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ece4;font-size:13px;text-align:right;color:#1a1209;font-weight:600;">
          ${cur}${Number(t.cost).toLocaleString('en-IN')}
        </td>
      </tr>`).join('')
    : `<tr><td style="padding:8px 12px;font-size:13px;color:#1a1209;" colspan="2">Dental Treatment Services</td></tr>`

  const subtotal = treatments.reduce((s, t) => s + (t.cost || 0), 0) || bill.total_amount
  const discountLine = bill.discount > 0
    ? `<tr><td style="padding:4px 12px;font-size:12px;color:#9a7c50;">Discount (${bill.discount}%)</td><td style="padding:4px 12px;font-size:12px;text-align:right;color:#c53030;">- ${cur}${Math.round(subtotal * bill.discount / 100).toLocaleString('en-IN')}</td></tr>`
    : ''
  const taxLine = bill.tax_percent > 0
    ? `<tr><td style="padding:4px 12px;font-size:12px;color:#9a7c50;">GST (${bill.tax_percent}%)</td><td style="padding:4px 12px;font-size:12px;text-align:right;color:#1a1209;">+ ${cur}${Number(bill.tax_amount || 0).toLocaleString('en-IN')}</td></tr>`
    : ''

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: toEmail.trim(),
    subject: `Invoice ${bill.invoice_number || ''} — Dr. Mahe's Dentistry`,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f5f0e8;margin:0;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;background:#fffdf9;border-radius:20px;overflow:hidden;border:1px solid #e8dfc8;">
    <div style="background:#1a1209;padding:28px 36px;">
      <img src="cid:logo_black" alt="Dr. Mahe's Dentistry" style="height:52px;">
    </div>
    <div style="height:4px;background:linear-gradient(90deg,#c9a96e,#e8d5a3,#c9a96e);"></div>
    <div style="padding:32px 36px;">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9a7c50;margin:0 0 16px;">Invoice Receipt</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
        <tr>
          <td style="font-size:13px;color:#6b5c45;">Invoice No.</td>
          <td style="font-size:13px;font-weight:700;color:#1a1209;text-align:right;">${bill.invoice_number || '—'}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6b5c45;">Patient</td>
          <td style="font-size:13px;font-weight:700;color:#1a1209;text-align:right;">${bill.patient_name || ''}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6b5c45;">Date</td>
          <td style="font-size:13px;color:#1a1209;text-align:right;">${date}</td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e8dfc8;margin:20px 0;">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9a7c50;margin:0 0 8px;">Treatment Details</p>
      <table style="width:100%;border-collapse:collapse;background:#f9f4eb;border-radius:12px;overflow:hidden;">
        ${rowsHtml}
        ${discountLine}
        ${taxLine}
        <tr style="background:#1a1209;">
          <td style="padding:12px;font-size:14px;font-weight:700;color:#e8d5a3;">Total</td>
          <td style="padding:12px;font-size:14px;font-weight:700;color:#e8d5a3;text-align:right;">${cur}${Number(bill.total_amount).toLocaleString('en-IN')}</td>
        </tr>
      </table>
      <div style="margin-top:16px;padding:12px 16px;background:${bill.balance > 0 ? '#fff5f5' : '#f0fdf4'};border-radius:10px;border:1px solid ${bill.balance > 0 ? '#fecaca' : '#bbf7d0'};">
        <span style="font-size:13px;font-weight:600;color:${bill.balance > 0 ? '#c53030' : '#276749'};">
          ${bill.balance > 0 ? `Balance Due: ${cur}${Number(bill.balance).toLocaleString('en-IN')}` : '✓ Fully Paid'}
        </span>
      </div>
    </div>
    <div style="background:#f2ebe0;padding:24px 36px;border-top:1px solid #e0d0b0;text-align:center;">
      <p style="margin:0;font-size:13px;font-weight:600;color:#1a1209;">Dr. Mahe's Dentistry</p>
      <p style="margin:6px 0 0;font-size:12px;color:#6b5c45;">Porur, Chennai — 📞 +91 93428 03217</p>
    </div>
  </div>
</body>
</html>`,
    attachments: [
      {
        filename: 'logo_black.png',
        path: path.join(__dirname, '../website/public/assets/logo_black.png'),
        cid: 'logo_black'
      }
    ]
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('[email] Failed to send invoice:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Sends a 2FA OTP code to the clinic admin email.
 *
 * @param {string} toEmail   - Admin email address to receive the code
 * @param {string} otpCode   - 6-digit OTP string
 */
async function sendOtpEmail(toEmail, otpCode) {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: toEmail.trim(),
    subject: `🔐 Your Portal Login Code: ${otpCode}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal Login Code</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b1222;
      color: #e2e8f0;
    }
    .wrapper {
      max-width: 520px;
      margin: 40px auto;
      background: linear-gradient(145deg, #0f1e38, #0b1222);
      border: 1px solid #1e3a5f;
      border-radius: 20px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #0d9488, #0f766e);
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .header p {
      font-size: 13px;
      color: rgba(255,255,255,0.75);
      margin-top: 6px;
    }
    .body {
      padding: 40px;
      text-align: center;
    }
    .body p.intro {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .otp-box {
      display: inline-block;
      background: #0a1628;
      border: 2px solid #0d9488;
      border-radius: 16px;
      padding: 24px 48px;
      margin-bottom: 28px;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #0d9488;
      margin-bottom: 10px;
    }
    .otp-code {
      font-size: 44px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #ffffff;
      font-variant-numeric: tabular-nums;
    }
    .expiry-note {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 32px;
    }
    .expiry-note strong {
      color: #f59e0b;
    }
    .security-note {
      background: #0a1628;
      border: 1px solid #1e3a5f;
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
      text-align: left;
    }
    .security-note strong {
      color: #94a3b8;
    }
    .footer {
      padding: 20px 40px;
      border-top: 1px solid #1e3a5f;
      text-align: center;
      font-size: 11px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🦷 Dr. Mahe's Dentistry</h1>
      <p>Clinical Management System — Secure Login</p>
    </div>
    <div class="body">
      <p class="intro">
        A login was attempted on your CMS portal.<br>
        Use the code below to complete your sign-in.
      </p>
      <div class="otp-box">
        <div class="otp-label">Your Login Code</div>
        <div class="otp-code">${otpCode}</div>
      </div>
      <p class="expiry-note">
        This code expires in <strong>5 minutes</strong>. Do not share it with anyone.
      </p>
      <div class="security-note">
        <strong>⚠️ Security Notice:</strong> If you did not attempt to log in, someone else may have your portal password.
        Please change your CMS password immediately in Settings.
      </div>
    </div>
    <div class="footer">
      This is an automated security message from Dr. Mahe's Dentistry CMS · Do not reply
    </div>
  </div>
</body>
</html>`,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('[email] OTP email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('[email] Failed to send OTP email:', err.message)
    throw err // Re-throw so auth.js can catch and return 500
  }
}

module.exports = {
  sendAppointmentConfirmation,
  sendInvoiceEmail,
  sendOtpEmail,
}
