const express = require('express');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const generateTripId = require('../utils/generateTripId');
const generateToken = require('../utils/generateToken');

const router = express.Router();

// POST /api/payment/initiate
// Creates a pending trip and returns the tripId for the simulated payment step
router.post('/initiate', async (req, res, next) => {
  try {
    const { routeId, passengerName, passengerPhone, seatNumber, emergencyContact, busId } = req.body;

    if (!routeId || !passengerName || !passengerPhone || !seatNumber || !emergencyContact) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ error: 'Route not found' });

    let tripId;
    let attempts = 0;
    do {
      tripId = generateTripId();
      attempts++;
    } while ((await Trip.findOne({ tripId })) && attempts < 10);

    await Trip.create({
      tripId,
      routeId,
      busId: busId || undefined,
      passengerName,
      passengerPhone,
      seatNumber,
      emergencyContact,
      status: 'pending',
      paymentStatus: 'pending',
    });

    res.json({
      tripId,
      route: { origin: route.origin, destination: route.destination, price: route.price },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payment/verify
// Simulated payment confirmation — marks trip as paid and assigns a bus
router.post('/verify', async (req, res, next) => {
  try {
    const { tripId } = req.body;

    const trip = await Trip.findOne({ tripId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    if (trip.paymentStatus === 'paid') {
      const populated = await Trip.findOne({ tripId }).populate('routeId', 'origin destination waypoints price');
      return res.json({ success: true, tripId, trackingToken: trip.trackingToken, trip: populated });
    }

    // Assign a bus on this route if not already assigned
    let busId = trip.busId;
    if (!busId) {
      const availableBus = await Bus.findOne({ currentRouteId: trip.routeId });
      if (availableBus) busId = availableBus._id;
    }

    const trackingToken = generateToken();

    const updated = await Trip.findOneAndUpdate(
      { tripId },
      {
        status: 'active',
        paymentStatus: 'paid',
        trackingToken,
        paymentRef: `SIM-${tripId}`,
        busId: busId || trip.busId,
      },
      { new: true }
    ).populate('routeId', 'origin destination waypoints price');

    if (busId) {
      await Bus.findByIdAndUpdate(busId, {
        status: 'on-route',
        currentTripId: trip._id,
        currentRouteId: trip.routeId,
      });
    }

    res.json({
      success: true,
      tripId,
      trackingToken,
      trackingUrl: `${process.env.CLIENT_URL}/track/${trackingToken}`,
      trip: updated,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
