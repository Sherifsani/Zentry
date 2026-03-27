const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
  currentRouteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  currentTripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  status: {
    type: String,
    enum: ['idle', 'on-route', 'delayed', 'stopped', 'alert', 'arrived', 'offline'],
    default: 'idle',
  },
  lastLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  lastPingAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
