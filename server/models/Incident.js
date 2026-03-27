const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  tripId: { type: String },  // human-readable tripId (ST-XXXXXX)
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator' },
  type: {
    type: String,
    enum: ['suspicious-stop', 'armed-attack', 'accident', 'feeling-unsafe', 'other', 'auto-anomaly', 'gps-loss', 'route-deviation'],
    required: true,
  },
  source: { type: String, enum: ['passenger', 'ai'], default: 'passenger' },
  gps: {
    lat: { type: Number },
    lng: { type: Number },
  },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  resolvedNote: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
