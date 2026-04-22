require('dotenv').config();

const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const Reservation  = require('./models/Reservation');
const { sendCustomerConfirmation, sendOwnerNotification } = require('./utils/mailer');

const app  = express();
const PORT = process.env.PORT || 3001;

// Allowed frontend origins
const ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'https://prem836.github.io',         // GitHub Pages (production frontend)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // In development, allow any localhost origin
    if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-key']
}));
app.use(express.json());

// ── Rate Limiter — max 5 reservations per IP per hour ─────────────────────────
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many reservation attempts. Please try again in an hour or call us directly.' }
});

// ── MongoDB Connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    console.warn('⚠️   Server is running WITHOUT a database. Fix your MongoDB IP whitelist.');
    // process.exit(1);  ← removed so the server stays alive for testing
  });

// ── Admin Auth Middleware ─────────────────────────────────────────────────────
function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin key.' });
  }
  next();
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Fresh Vibes Café Reservation API', timestamp: new Date() });
});

// POST /api/reservations — Create new reservation
app.post('/api/reservations', reservationLimiter, async (req, res) => {
  try {
    const { name, phone, email, date, time, guests, occasion, notes } = req.body;

    // Validation
    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: 'Please fill in all required fields (name, phone, date, time, guests).' });
    }

    // Phone: must be a valid 10-digit Indian number (server-side safety net)
    const phoneDigits = String(phone).replace(/[\s\-().+]/g, '');
    const barePhone = phoneDigits.startsWith('91') && phoneDigits.length === 12 ? phoneDigits.slice(2) : phoneDigits;
    if (!/^[6-9]\d{9}$/.test(barePhone)) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number.' });
    }

    // Email: basic format check if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Date: must not be in the past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({ error: 'Reservation date cannot be in the past.' });
    }

    // Save to database
    const reservation = new Reservation({ name, phone, email, date, time, guests, occasion, notes });
    await reservation.save();

    // Send emails in background (don't block the response)
    Promise.all([
      sendCustomerConfirmation(reservation),
      sendOwnerNotification(reservation)
    ]).catch(err => console.error('⚠️  Email error (booking was saved):', err.message));

    res.status(201).json({
      success: true,
      message: 'Your reservation has been received! We will call you to confirm.',
      id: reservation._id
    });

  } catch (err) {
    console.error('Reservation creation error:', err);
    res.status(500).json({ error: 'Something went wrong. Please call us directly at +91 97962 23627.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES (protected by x-admin-key header)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/stats
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const [total, pending, confirmed, cancelled] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.countDocuments({ status: 'confirmed' }),
      Reservation.countDocuments({ status: 'cancelled' })
    ]);
    res.json({ total, pending, confirmed, cancelled });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// GET /api/admin/reservations — list with filter + search
app.get('/api/admin/reservations', adminAuth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const reservations = await Reservation.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(filter);
    res.json({ reservations, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservations.' });
  }
});

// PATCH /api/admin/reservations/:id — update status
app.patch('/api/admin/reservations/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
    res.json({ success: true, reservation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reservation.' });
  }
});

// DELETE /api/admin/reservations/:id
app.delete('/api/admin/reservations/:id', adminAuth, async (req, res) => {
  try {
    const result = await Reservation.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Reservation not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reservation.' });
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Fresh Vibes Café server running at http://localhost:${PORT}`);
  console.log(`📋  Admin dashboard:             http://localhost:5500/admin.html`);
  console.log(`💚  Health check:                http://localhost:${PORT}/api/health\n`);
});
