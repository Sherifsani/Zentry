const haversine = require('./haversine');

/**
 * Returns { percent, nearestWaypointIndex }
 * percent: 0-100 journey progress based on nearest waypoint
 */
const routeProgress = (busPos, waypoints) => {
  if (!waypoints || waypoints.length < 2) return { percent: 0, nearestWaypointIndex: 0 };

  let minDist = Infinity;
  let nearestIdx = 0;

  waypoints.forEach((wp, i) => {
    const dist = haversine(busPos, wp);
    if (dist < minDist) {
      minDist = dist;
      nearestIdx = i;
    }
  });

  const percent = Math.round((nearestIdx / (waypoints.length - 1)) * 100);
  return { percent, nearestWaypointIndex: nearestIdx };
};

module.exports = routeProgress;
