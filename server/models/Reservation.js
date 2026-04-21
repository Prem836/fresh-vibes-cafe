const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    email:    { type: String, trim: true, default: '' },
    date:     { type: String, required: true },
    time:     { type: String, required: true },
    guests:   { type: String, required: true },
    occasion: { type: String, default: 'regular' },
    notes:    { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
