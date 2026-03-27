const Incident = require('../models/Incident');
const { getIO } = require('../config/socket');
const haversine = require('../utils/haversine');

/**
 * Runs all anomaly checks on a GPS ping.
 * Called synchronously inside the GPS ping handler.
 */
const analyze = async (ping, bus, route, trip) => {
  if (!route || !bus) return;

  const io = getIO();
  const operatorRoom = `operator:${bus.operatorId}`;
  const tripRoom = `trip:${ping.tripId}`;

  // 1. Speed-zero in high-risk zone
  if (ping.speed === 0 && route.riskScore === 'High') {
    const incident = await Incident.create({
      tripId: ping.tripId,
      busId: bus._id,
      routeId: route._id,
      operatorId: bus.operatorId,
      type: 'auto-anomaly',
      source: 'ai',
      gps: { lat: ping.lat, lng: ping.lng },
      status: 'active',
    });

    const alertPayload = {
      type: 'auto-anomaly',
      message: `Bus ${bus.plateNumber} stopped in a high-risk zone on ${route.origin}→${route.destination}`,
      busId: bus._id,
      plateNumber: bus.plateNumber,
      gps: { lat: ping.lat, lng: ping.lng },
      routeId: route._id,
      incidentId: incident._id,
      timestamp: new Date(),
    };

    io.to(operatorRoom).emit('anomaly-alert', alertPayload);
    io.to(tripRoom).emit('trip-status-change', { status: 'alert' });
    console.log(`[AI] Speed-zero anomaly: bus ${bus.plateNumber}`);
  }

  // 2. Route deviation (>500m from nearest waypoint)
  if (route.waypoints && route.waypoints.length > 0) {
    const minDist = Math.min(
      ...route.waypoints.map((wp) => haversine({ lat: ping.lat, lng: ping.lng }, wp))
    );
    if (minDist > 500) {
      const incident = await Incident.create({
        tripId: ping.tripId,
        busId: bus._id,
        routeId: route._id,
        operatorId: bus.operatorId,
        type: 'route-deviation',
        source: 'ai',
        gps: { lat: ping.lat, lng: ping.lng },
        status: 'active',
      });

      io.to(operatorRoom).emit('anomaly-alert', {
        type: 'route-deviation',
        message: `Bus ${bus.plateNumber} deviated ${Math.round(minDist)}m from route on ${route.origin}→${route.destination}`,
        busId: bus._id,
        plateNumber: bus.plateNumber,
        gps: { lat: ping.lat, lng: ping.lng },
        routeId: route._id,
        incidentId: incident._id,
        deviationMetres: Math.round(minDist),
        timestamp: new Date(),
      });
      console.log(`[AI] Route deviation: bus ${bus.plateNumber}, ${Math.round(minDist)}m off route`);
    }
  }
};

module.exports = { analyze };
