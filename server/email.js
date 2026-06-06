const nodemailer = require('nodemailer')

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
    from: process.env.EMAIL_FROM || '"Dr. Mahe\'s Dentistry" <smile@drmahesdentistry.in>',
    to: toEmail.trim(),
    subject: "Thank You for Choosing Dr. Mahe's Dentistry!",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed - Dr. Mahe's Dentistry</title>
  <style>
    :root {
      --primary: #0ea5e9;
      --primary-dark: #0284c7;
      --bg-color: #f1f5f9;
      --card-bg: #ffffff;
      --text-main: #334155;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      margin: 0;
      padding: 0;
      color: var(--text-main);
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      padding: 40px 20px;
      width: 100%;
      box-sizing: border-box;
      background-color: #f1f5f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: var(--card-bg);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .header {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      padding: 48px 40px;
      text-align: center;
      color: #ffffff;
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%);
      pointer-events: none;
    }
    .logo-container {
      margin-bottom: 8px;
    }
    .logo-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
    .logo-text {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0;
      color: #ffffff;
    }
    .logo-sub {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      margin-top: 6px;
      letter-spacing: 0.05em;
    }
    .content {
      padding: 48px 40px;
      background-color: #ffffff;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .intro-text {
      font-size: 16px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 36px;
    }
    .card-wrapper {
      background-color: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 36px;
      position: relative;
    }
    .card-wrapper::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 6px; height: 100%;
      background-color: var(--primary);
      border-radius: 20px 0 0 20px;
    }
    .details-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary-dark);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .detail-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .detail-value {
      font-size: 17px;
      font-weight: 600;
      color: #0f172a;
    }
    .note-box {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      padding: 20px 24px;
      border-radius: 16px;
      display: flex;
      gap: 12px;
    }
    .note-icon {
      font-size: 20px;
      flex-shrink: 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 36px 40px;
      text-align: center;
      border-top: 1px solid var(--border-color);
    }
    .footer-title {
      font-weight: 700;
      color: #334155;
      font-size: 16px;
      margin-bottom: 12px;
    }
    .footer-text {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .footer-disclaimer {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
    }
    
    @media (max-width: 600px) {
      .wrapper { padding: 20px 10px; }
      .header { padding: 36px 24px; }
      .content { padding: 36px 24px; }
      .card-wrapper { padding: 24px; }
      .footer { padding: 32px 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      <div class="header">
        <div class="logo-container">
          <div class="logo-text">Dr. Mahe's Dentistry</div>
          <div class="logo-sub">PREMIUM DENTAL CARE</div>
        </div>
      </div>
      
      <div class="content">
        <div class="greeting">Hi ${patientName},</div>
        <div class="intro-text">
          Thank you for choosing Dr. Mahe's Dentistry. We're looking forward to your visit. Your appointment has been successfully confirmed. Here are your booking details:
        </div>
        
        <div class="card-wrapper">
          <div class="details-title">Appointment Details</div>
          
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Date</span>
              <span class="detail-value">${dateFormatted}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Time</span>
              <span class="detail-value">${timeSlot || 'Walk-in'}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Service</span>
              <span class="detail-value">${service || 'General Consultation'}</span>
            </div>
          </div>
        </div>
        
        <div class="note-box">
          <div class="note-icon">💡</div>
          <div>
            <strong>Quick tip:</strong> Please arrive 10 minutes early to your appointment. Need to change your plans? Kindly let us know 24 hours in advance.
          </div>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-title">Dr. Mahe's Dentistry</div>
        <div class="footer-text">
          1st Floor, Kundrathur Main Rd, Jaya Nagar<br>
          Porur, Chennai - 600116
        </div>
        <div class="footer-text">
          <strong>Phone:</strong> +91 94440 12345<br>
          <strong>WhatsApp:</strong> +91 94440 12345
        </div>
        <div class="footer-disclaimer">
          This is an automated message. Please do not reply directly to this email.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
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
