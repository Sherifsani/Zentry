const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  tripId: { type: String, required: true, unique: true },   // ST-XXXXXX
  trackingToken: { type: String, unique: true, sparse: true }, // for family link
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  passengerName: { type: String, required: true },
  passengerPhone: { type: String, required: true },
  seatNumber: { type: String, required: true },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'on-route', 'delayed', 'stopped', 'alert', 'arrived', 'cancelled'],
    default: 'pending',
  },
  paymentRef: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  lastMilestoneIndex: { type: Number, default: -1 },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
