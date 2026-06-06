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
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #1e293b;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.05em;
      margin: 0;
      text-transform: uppercase;
    }
    .logo-sub {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 4px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 35px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 15px;
    }
    .intro-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 30px;
    }
    .details-card {
      background-color: #f0f9ff;
      border: 1px solid #e0f2fe;
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 30px;
    }
    .details-title {
      font-size: 13px;
      font-weight: 700;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 15px;
      border-bottom: 1px solid #bae6fd;
      padding-bottom: 8px;
    }
    .detail-row {
      display: flex;
      margin-bottom: 12px;
      font-size: 15px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      width: 110px;
      font-weight: 600;
      color: #64748b;
      flex-shrink: 0;
    }
    .detail-value {
      font-weight: 700;
      color: #0f172a;
    }
    .action-block {
      text-align: center;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      padding: 14px 30px;
      background-color: #0284c7;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      box-shadow: 0 4px 6px -1px rgb(2 132 199 / 0.2);
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #0369a1;
    }
    .note-box {
      font-size: 13px;
      line-height: 1.6;
      color: #64748b;
      background-color: #f8fafc;
      border-left: 4px solid #cbd5e1;
      padding: 15px;
      border-radius: 0 12px 12px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer-title {
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-text">DR. MAHE'S DENTISTRY</div>
      <div class="logo-sub">Your Smile, Our Priority</div>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${patientName},</div>
      <div class="intro-text">
        Thank you for choosing Dr. Mahe's Dentistry. We are pleased to confirm that your appointment has been successfully booked. Please find the details of your visit below:
      </div>
      
      <div class="details-card">
        <div class="details-title">Appointment Summary</div>
        
        <div class="detail-row">
          <span class="detail-label">Patient Name</span>
          <span class="detail-value">${patientName}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${dateFormatted}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Time Slot</span>
          <span class="detail-value">${timeSlot || 'Walk-in'}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${service || 'General Consultation'}</span>
        </div>
      </div>
      
      <div class="note-box">
        <strong>Important Instructions:</strong> Please arrive 10 minutes prior to your scheduled time. If you need to reschedule or cancel your appointment, please contact the clinic at least 24 hours in advance.
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-title">Dr. Mahe's Dentistry</div>
      1st Floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai - 600116<br>
      Clinic Phone: +91 94440 12345 · WhatsApp: +91 94440 12345<br>
      <span style="display: block; margin-top: 15px; font-size: 10px;">This is an automated appointment confirmation email. Please do not reply directly to this message.</span>
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
