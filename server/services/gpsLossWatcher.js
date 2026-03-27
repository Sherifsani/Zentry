const Bus = require('../models/Bus');
const Incident = require('../models/Incident');
const { getIO } = require('../config/socket');

const GPS_LOSS_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL_MS = 60 * 1000;          // check every 60 seconds

let intervalId = null;

const checkGPSLoss = async () => {
  try {
    const cutoff = new Date(Date.now() - GPS_LOSS_THRESHOLD_MS);
    const staleBuses = await Bus.find({
      status: { $in: ['on-route', 'delayed', 'stopped'] },
      lastPingAt: { $lt: cutoff },
    });

    const io = getIO();

    for (const bus of staleBuses) {
      await Bus.findByIdAndUpdate(bus._id, { status: 'offline' });

      const incident = await Incident.create({
        busId: bus._id,
        operatorId: bus.operatorId,
        routeId: bus.currentRouteId,
        type: 'gps-loss',
        source: 'ai',
        status: 'active',
      });

      io.to(`operator:${bus.operatorId}`).emit('anomaly-alert', {
        type: 'gps-loss',
        message: `GPS signal lost for bus ${bus.plateNumber} — last seen ${Math.round((Date.now() - new Date(bus.lastPingAt)) / 60000)} min ago`,
        busId: bus._id,
        plateNumber: bus.plateNumber,
        incidentId: incident._id,
        timestamp: new Date(),
      });

      console.log(`[GPS Watcher] Signal lost: bus ${bus.plateNumber}`);
    }
  } catch (err) {
    console.error('[GPS Watcher] Error:', err.message);
  }
};

const start = () => {
  if (intervalId) return;
  intervalId = setInterval(checkGPSLoss, CHECK_INTERVAL_MS);
  console.log('[GPS Watcher] Started — checking every 60s');
};

const stop = () => {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
};

module.exports = { start, stop };
