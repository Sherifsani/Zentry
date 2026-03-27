const express = require('express');
const GPSPing = require('../models/GPSPing');
const Bus = require('../models/Bus');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const { getIO } = require('../config/socket');
const { analyze } = require('../services/anomalyEngine');
const { sendSMS } = require('../services/termiiService');
const haversine = require('../utils/haversine');
const routeProgress = require('../utils/routeProgress');

const router = express.Router();

// POST /api/gps/ping — simulation endpoint (replaces driver app)
router.post('/ping', async (req, res, next) => {
  try {
    const { busId, lat, lng, speed = 0 } = req.body;
    if (!busId || lat == null || lng == null) {
      return res.status(400).json({ error: 'busId, lat, lng required' });
    }

    const bus = await Bus.findById(busId).populate('currentRouteId');
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const route = bus.currentRouteId;

    // Find active trip for this bus
    const trip = await Trip.findOne({ busId, status: { $in: ['active', 'on-route', 'delayed'] } });

    // Save ping
    const ping = await GPSPing.create({
      busId,
      tripId: trip?.tripId,
      lat,
      lng,
      speed,
      timestamp: new Date(),
    });

    // Update bus last known position
    await Bus.findByIdAndUpdate(busId, {
      lastLocation: { lat, lng },
      lastPingAt: new Date(),
      status: speed === 0 ? 'stopped' : 'on-route',
    });

    // Compute route progress
    let progress = 0;
    let nearestWaypointIndex = 0;
    if (route?.waypoints?.length) {
      const result = routeProgress({ lat, lng }, route.waypoints);
      progress = result.percent;
      nearestWaypointIndex = result.nearestWaypointIndex;
    }

    // Determine trip status
    let tripStatus = speed === 0 ? 'stopped' : 'on-route';
    if (progress >= 95) tripStatus = 'arrived';

    // Broadcast to trip room and operator room
    const io = getIO();
    const gpsPayload = {
      lat,
      lng,
      speed,
      progress,
      status: tripStatus,
      timestamp: new Date(),
    };

    if (trip) {
      io.to(`trip:${trip.tripId}`).emit('gps-update', gpsPayload);

      // Update trip status
      if (tripStatus !== trip.status) {
        await Trip.findByIdAndUpdate(trip._id, { status: tripStatus });
        io.to(`trip:${trip.tripId}`).emit('trip-status-change', { status: tripStatus });
      }

      // Milestone SMS — check if bus passed a new waypoint
      if (route?.waypoints && trip.lastMilestoneIndex !== nearestWaypointIndex) {
        const milestone = route.waypoints[nearestWaypointIndex];
        // Only notify for interior waypoints (not origin/destination)
        if (
          nearestWaypointIndex > 0 &&
          nearestWaypointIndex < route.waypoints.length - 1 &&
          nearestWaypointIndex > trip.lastMilestoneIndex
        ) {
          const distToMilestone = haversine({ lat, lng }, milestone);
          if (distToMilestone < 5000) { // within 5km of waypoint
            await Trip.findByIdAndUpdate(trip._id, { lastMilestoneIndex: nearestWaypointIndex });
            const smsText = `SafeTrack: The bus carrying ${trip.passengerName} has passed ${milestone.name} on the ${route.origin}→${route.destination} route.`;
            sendSMS(trip.emergencyContact.phone, smsText);
          }
        }

        // Arrived SMS
        if (progress >= 95 && trip.lastMilestoneIndex < route.waypoints.length - 1) {
          await Trip.findByIdAndUpdate(trip._id, { lastMilestoneIndex: route.waypoints.length });
          const smsText = `SafeTrack: ${trip.passengerName} has arrived at ${route.destination}. Journey complete.`;
          sendSMS(trip.emergencyContact.phone, smsText);
        }
      }
    }

    // Emit to operator room regardless of trip
    io.to(`operator:${bus.operatorId}`).emit('bus-location', {
      busId,
      plateNumber: bus.plateNumber,
      lat,
      lng,
      speed,
      status: tripStatus,
      tripId: trip?.tripId,
      timestamp: new Date(),
    });

    // Run AI anomaly engine
    if (trip) {
      analyze(ping, bus, route, trip).catch(console.error);
    }

    res.json({ success: true, progress, status: tripStatus });
  } catch (err) {
    next(err);
  }
});

// GET /api/gps/:busId/history — last 50 pings
router.get('/:busId/history', async (req, res, next) => {
  try {
    const pings = await GPSPing.find({ busId: req.params.busId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(pings.reverse());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
