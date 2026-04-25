const nodemailer = require('nodemailer');

// ── Transporter ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(time) {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

const occasionLabels = {
  regular:     'Regular Meal',
  birthday:    'Birthday Celebration 🎂',
  anniversary: 'Anniversary 💑',
  family:      'Family Get-Together',
  business:    'Business Lunch',
  other:       'Other'
};

const guestLabels = {
  '1': '1 Person', '2': '2 People', '3': '3 People',
  '4': '4 People', '5': '5 People', '6': '6 People',
  '7-10': '7–10 People', '10+': '10+ People (Group)'
};

// ── Customer Confirmation Email ───────────────────────────────────────────────
async function sendCustomerConfirmation(reservation) {
  const timeStr     = formatTime(reservation.time);
  const occasionStr = occasionLabels[reservation.occasion] || reservation.occasion;
  const guestStr    = guestLabels[reservation.guests] || `${reservation.guests} Guests`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reservation Received – Fresh Vibes Café</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; background: #f4f0ea; padding: 30px 15px; }
    .wrap  { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,.12); }
    .hdr   { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); padding: 40px 30px; text-align: center; }
    .logo  { font-size: 30px; letter-spacing: 3px; }
    .logo .fr { color: #f5c518; font-style: italic; }
    .logo .vi { color: #fff; font-weight: 700; }
    .logo .ca { color: #f5c518; font-size: 14px; letter-spacing: 6px; display: block; margin-top: 4px; }
    .tagline { color: #aaa; font-size: 13px; margin-top: 8px; font-family: Arial, sans-serif; }
    .badge-wrap { padding: 25px 30px 0; text-align: center; }
    .status-badge { display: inline-block; background: linear-gradient(135deg, #f5c518, #e6a800); color: #1a1a2e; padding: 8px 24px; border-radius: 30px; font-weight: 700; font-size: 14px; font-family: Arial, sans-serif; letter-spacing: 0.5px; }
    .body  { padding: 30px; }
    .greeting { font-size: 24px; color: #1a1a2e; font-weight: 700; margin-bottom: 10px; }
    .intro { color: #666; font-size: 15px; line-height: 1.7; margin-bottom: 28px; font-family: Arial, sans-serif; }
    .card  { background: linear-gradient(135deg, #faf7ff, #fff8ee); border: 1px solid #e2d5b5; border-radius: 14px; padding: 24px; margin-bottom: 24px; }
    .card-title { font-size: 13px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; font-family: Arial, sans-serif; }
    .row   { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #ede8d8; font-family: Arial, sans-serif; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .row-icon { width: 28px; font-size: 16px; flex-shrink: 0; }
    .row-label { color: #999; width: 100px; flex-shrink: 0; }
    .row-val { color: #1a1a2e; font-weight: 600; }
    .note  { background: #f0fff4; border-left: 4px solid #4caf50; border-radius: 4px; padding: 14px 18px; font-family: Arial, sans-serif; font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 24px; }
    .cta   { text-align: center; margin: 24px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #f5c518 0%, #e09800 100%); color: #1a1a2e; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 16px; font-family: Arial, sans-serif; letter-spacing: 0.3px; }
    .ftr   { background: #1a1a2e; padding: 24px 30px; text-align: center; }
    .ftr p { color: #888; font-size: 13px; font-family: Arial, sans-serif; line-height: 1.8; }
    .ftr a { color: #f5c518; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <!-- Header -->
    <div class="hdr">
      <div class="logo">
        <span class="fr">fresh</span><span class="vi">Vibes</span>
        <span class="ca">C A F É</span>
      </div>
      <p class="tagline">100% Pure Vegetarian &nbsp;•&nbsp; Family Restaurant &nbsp;•&nbsp; Kathua, J&amp;K</p>
    </div>

    <!-- Status Badge -->
    <div class="badge-wrap">
      <span class="status-badge">🎉 Reservation Received!</span>
    </div>

    <!-- Body -->
    <div class="body">
      <div class="greeting">Hi ${reservation.name}! 👋</div>
      <p class="intro">
        Thank you for choosing <strong>Fresh Vibes Café</strong>! Your reservation request has been received and our team will confirm it shortly by calling you on your number.
      </p>

      <!-- Booking Details Card -->
      <div class="card">
        <div class="card-title">📋 Your Booking Summary</div>
        <div class="row"><span class="row-icon">👤</span><span class="row-label">Name</span><span class="row-val">${reservation.name}</span></div>
        <div class="row"><span class="row-icon">📞</span><span class="row-label">Phone</span><span class="row-val">${reservation.phone}</span></div>
        <div class="row"><span class="row-icon">📅</span><span class="row-label">Date</span><span class="row-val">${reservation.date}</span></div>
        <div class="row"><span class="row-icon">⏰</span><span class="row-label">Time</span><span class="row-val">${timeStr}</span></div>
        <div class="row"><span class="row-icon">👥</span><span class="row-label">Guests</span><span class="row-val">${guestStr}</span></div>
        <div class="row"><span class="row-icon">🎊</span><span class="row-label">Occasion</span><span class="row-val">${occasionStr}</span></div>
        ${reservation.notes ? `<div class="row"><span class="row-icon">📝</span><span class="row-label">Notes</span><span class="row-val">${reservation.notes}</span></div>` : ''}
        <div class="row"><span class="row-icon">🟡</span><span class="row-label">Status</span><span class="row-val">Pending Confirmation</span></div>
      </div>

      <!-- Note -->
      <div class="note">
        ℹ️ We'll call you on <strong>${reservation.phone}</strong> to confirm your table. Need to modify or cancel? Call us directly.
      </div>

      <!-- CTA -->
      <div class="cta">
        <a href="tel:+917006010348">📞 Call Us: +91 70060 10348</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="ftr">
      <p>📍 Near Vaid Ayurvedic, Chadwal More, NH-44, Kathua, J&amp;K 184144</p>
      <p>📞 <a href="tel:+917006010348">+91 70060 10348</a> &nbsp;|&nbsp; ✉️ <a href="mailto:${process.env.GMAIL_USER}">${process.env.GMAIL_USER}</a></p>
      <p style="margin-top:12px; color:#555; font-size:12px;">© 2026 Fresh Vibes Café. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  // Only send if the customer provided an email
  if (!reservation.email) return;

  await transporter.sendMail({
    from: `"Fresh Vibes Café" <${process.env.GMAIL_USER}>`,
    to: reservation.email,
    subject: `✅ We got your reservation, ${reservation.name}! – Fresh Vibes Café`,
    html
  });
}

// ── Owner Notification Email ──────────────────────────────────────────────────
async function sendOwnerNotification(reservation) {
  const timeStr     = formatTime(reservation.time);
  const occasionStr = occasionLabels[reservation.occasion] || reservation.occasion;
  const guestStr    = guestLabels[reservation.guests] || `${reservation.guests} Guests`;
  const receivedAt  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // WhatsApp deep link — opens WhatsApp with booking details pre-filled
  const waText = encodeURIComponent(
    `🔔 *New Reservation – Fresh Vibes Café*\n\n` +
    `👤 *Name:* ${reservation.name}\n` +
    `📞 *Phone:* ${reservation.phone}\n` +
    `📅 *Date:* ${reservation.date}\n` +
    `⏰ *Time:* ${timeStr}\n` +
    `👥 *Guests:* ${guestStr}\n` +
    `🎊 *Occasion:* ${occasionStr}\n` +
    (reservation.notes ? `📝 *Notes:* ${reservation.notes}\n` : '') +
    `\n✅ Confirm or ❌ Cancel this booking.`
  );
  const waLink = `https://wa.me/917006010348?text=${waText}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px; }
    .wrap  { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
    .hdr   { background: #1a1a2e; padding: 20px 25px; display: flex; align-items: center; gap: 12px; }
    .hdr-icon { font-size: 28px; }
    .hdr h2 { color: #f5c518; font-size: 18px; font-weight: 700; }
    .hdr p  { color: #aaa; font-size: 13px; margin-top: 2px; }
    .alert { background: #fff8e1; border: 2px solid #f5c518; margin: 20px; border-radius: 10px; padding: 14px 18px; font-size: 15px; font-weight: 700; color: #7a5c00; }
    .body  { padding: 0 20px 20px; }
    .detail { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .detail:last-child { border-bottom: none; }
    .d-icon { font-size: 17px; width: 24px; text-align: center; flex-shrink: 0; margin-top: 1px; }
    .d-label { color: #999; width: 90px; flex-shrink: 0; }
    .d-val  { color: #222; font-weight: 600; }
    .d-val a { color: #1a73e8; text-decoration: none; }
    .actions { display: flex; gap: 10px; padding: 20px; flex-wrap: wrap; }
    .btn-call { flex: 1; background: #25d366; color: #fff; text-decoration: none; padding: 13px 16px; border-radius: 9px; font-weight: 700; font-size: 15px; text-align: center; display: block; }
    .btn-wa   { flex: 1; background: #128c7e; color: #fff; text-decoration: none; padding: 13px 16px; border-radius: 9px; font-weight: 700; font-size: 15px; text-align: center; display: block; }
    .ftr   { background: #f8f9fa; border-top: 1px solid #eee; padding: 14px 20px; font-size: 12px; color: #aaa; text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="hdr-icon">🔔</div>
      <div>
        <h2>New Table Reservation</h2>
        <p>Fresh Vibes Café — Booking Alert</p>
      </div>
    </div>

    <div class="alert">⚡ Action Required: A new booking has been received!</div>

    <div class="body">
      <div class="detail"><span class="d-icon">👤</span><span class="d-label">Name</span><span class="d-val">${reservation.name}</span></div>
      <div class="detail"><span class="d-icon">📞</span><span class="d-label">Phone</span><span class="d-val"><a href="tel:${reservation.phone}">${reservation.phone}</a></span></div>
      ${reservation.email ? `<div class="detail"><span class="d-icon">✉️</span><span class="d-label">Email</span><span class="d-val"><a href="mailto:${reservation.email}">${reservation.email}</a></span></div>` : ''}
      <div class="detail"><span class="d-icon">📅</span><span class="d-label">Date</span><span class="d-val">${reservation.date}</span></div>
      <div class="detail"><span class="d-icon">⏰</span><span class="d-label">Time</span><span class="d-val">${timeStr}</span></div>
      <div class="detail"><span class="d-icon">👥</span><span class="d-label">Guests</span><span class="d-val">${guestStr}</span></div>
      <div class="detail"><span class="d-icon">🎊</span><span class="d-label">Occasion</span><span class="d-val">${occasionStr}</span></div>
      ${reservation.notes ? `<div class="detail"><span class="d-icon">📝</span><span class="d-label">Notes</span><span class="d-val">${reservation.notes}</span></div>` : ''}
      <div class="detail"><span class="d-icon">🕐</span><span class="d-label">Received</span><span class="d-val">${receivedAt}</span></div>
    </div>

    <div class="actions">
      <a href="tel:${reservation.phone}" class="btn-call">📞 Call Customer</a>
      <a href="${waLink}" class="btn-wa">💬 Send WhatsApp</a>
    </div>

    <div class="ftr">This alert was sent automatically by Fresh Vibes Café Reservation System</div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Fresh Vibes Café System" <${process.env.GMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `🔔 New Booking: ${reservation.name} — ${reservation.date} at ${timeStr} (${guestStr})`,
    html
  });
}

module.exports = { sendCustomerConfirmation, sendOwnerNotification };
