const express = require('express');
const Trip = require('../models/Trip');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/trips/track/:token — public (family view) — MUST be before /:tripId
router.get('/track/:token', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ trackingToken: req.params.token })
      .populate('routeId', 'origin destination waypoints estimatedDuration departureTime')
      .populate('busId', 'plateNumber driverName status lastLocation lastPingAt');
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:tripId — by human-readable trip ID
router.get('/:tripId', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ tripId: req.params.tripId })
      .populate('routeId', 'origin destination waypoints price estimatedDuration departureTime')
      .populate('busId', 'plateNumber driverName status lastLocation lastPingAt');
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// GET /api/trips — operator: all trips for their buses
router.get('/', auth, async (req, res, next) => {
  try {
    const buses = await Bus.find({ operatorId: req.operator.id }).select('_id');
    const busIds = buses.map((b) => b._id);
    const trips = await Trip.find({ busId: { $in: busIds } })
      .populate('routeId', 'origin destination')
      .populate('busId', 'plateNumber driverName')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
