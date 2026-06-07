const nodemailer = require('nodemailer')
const path = require('path')

// Initialize transporter using SMTP config from env variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
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
        path: path.join(__dirname, '../website/assets/logo_black.png'),
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

module.exports = {
  sendAppointmentConfirmation
}
