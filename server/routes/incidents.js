const express = require('express');
const Incident = require('../models/Incident');
const Trip = require('../models/Trip');
const Bus = require('../models/Bus');
const { getIO } = require('../config/socket');
const { sendSMS } = require('../services/termiiService');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/incidents — passenger triggers SOS (no auth required)
router.post('/', async (req, res, next) => {
  try {
    const { tripId, type, lat, lng } = req.body;
    if (!tripId || !type) return res.status(400).json({ error: 'tripId and type required' });

    const trip = await Trip.findOne({ tripId })
      .populate('routeId', 'origin destination')
      .populate('busId', 'plateNumber operatorId');

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const bus = trip.busId;

    const incident = await Incident.create({
      tripId,
      busId: bus?._id,
      routeId: trip.routeId?._id,
      operatorId: bus?.operatorId,
      type,
      source: 'passenger',
      gps: { lat, lng },
      status: 'active',
    });

    // Update trip status to alert
    await Trip.findOneAndUpdate({ tripId }, { status: 'alert' });

    const io = getIO();

    // Alert operator dashboard
    if (bus?.operatorId) {
      io.to(`operator:${bus.operatorId}`).emit('sos-alert', {
        type,
        tripId,
        busId: bus._id,
        plateNumber: bus.plateNumber,
        route: trip.routeId
          ? `${trip.routeId.origin}→${trip.routeId.destination}`
          : 'Unknown route',
        passengerName: trip.passengerName,
        gps: { lat, lng },
        mapsLink: `https://maps.google.com/?q=${lat},${lng}`,
        incidentId: incident._id,
        timestamp: new Date(),
      });
    }

    // Emit to trip room (so family view shows alert status)
    io.to(`trip:${tripId}`).emit('trip-status-change', { status: 'alert', incidentId: incident._id });

    // SMS to emergency contact
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const typeLabel = {
      'suspicious-stop': 'Suspicious stop',
      'armed-attack': 'Armed attack',
      'accident': 'Accident',
      'feeling-unsafe': 'Feeling unsafe',
      'other': 'Safety concern',
    }[type] || type;

    const smsText = `SAFETRACK ALERT: ${trip.passengerName} has triggered an emergency alert (${typeLabel}) on their bus from ${trip.routeId?.origin || 'unknown'} to ${trip.routeId?.destination || 'unknown'}. Bus location: ${mapsLink}`;
    sendSMS(trip.emergencyContact.phone, smsText).catch(console.error);

    res.status(201).json({ success: true, incidentId: incident._id });
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents — operator auth
router.get('/', auth, async (req, res, next) => {
  try {
    const incidents = await Incident.find({ operatorId: req.operator.id })
      .populate('busId', 'plateNumber driverName')
      .populate('routeId', 'origin destination')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(incidents);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/incidents/:id/resolve — operator auth
router.patch('/:id/resolve', auth, async (req, res, next) => {
  try {
    const { note } = req.body;
    const incident = await Incident.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.operator.id },
      { status: 'resolved', resolvedNote: note || '', resolvedAt: new Date() },
      { new: true }
    );
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    // Update trip status back to on-route
    if (incident.tripId) {
      await Trip.findOneAndUpdate({ tripId: incident.tripId }, { status: 'on-route' });
      const io = getIO();
      io.to(`trip:${incident.tripId}`).emit('trip-status-change', { status: 'on-route' });
    }

    res.json(incident);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
