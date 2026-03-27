const mongoose = require('mongoose');

const gpsPingSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  tripId: { type: String },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  speed: { type: Number, default: 0 },  // km/h
  timestamp: { type: Date, default: Date.now },
});

// TTL index — auto-delete pings older than 7 days to keep Atlas free tier lean
gpsPingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('GPSPing', gpsPingSchema);
