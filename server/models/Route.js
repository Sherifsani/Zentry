const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
}, { _id: false });

const routeSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  waypoints: [waypointSchema],           // includes origin & destination as first/last
  price: { type: Number, required: true }, // NGN
  estimatedDuration: { type: Number },    // minutes
  departureTime: { type: String },        // e.g. "07:00"
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator' },
  riskScore: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  riskSummary: { type: String, default: '' },
  riskSummaryUpdatedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
