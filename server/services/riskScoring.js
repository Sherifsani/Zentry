const Incident = require('../models/Incident');
const Route = require('../models/Route');
const { generateRiskSummary } = require('./claudeService');

const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

/**
 * Computes risk score for a route based on recent incidents.
 * Updates the Route document if stale.
 */
const computeRouteRisk = async (route) => {
  const now = new Date();
  const isStale =
    !route.riskSummaryUpdatedAt ||
    now - new Date(route.riskSummaryUpdatedAt) > STALE_THRESHOLD_MS;

  if (!isStale) {
    return { score: route.riskScore, summary: route.riskSummary };
  }

  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const incidentCount = await Incident.countDocuments({
    routeId: route._id,
    createdAt: { $gte: thirtyDaysAgo },
    source: { $in: ['passenger', 'ai'] },
  });

  let score;
  if (incidentCount === 0) score = 'Low';
  else if (incidentCount <= 2) score = 'Medium';
  else score = 'High';

  const summary = await generateRiskSummary({
    origin: route.origin,
    destination: route.destination,
    riskScore: score,
    incidentCount,
  });

  await Route.findByIdAndUpdate(route._id, {
    riskScore: score,
    riskSummary: summary,
    riskSummaryUpdatedAt: now,
  });

  return { score, summary };
};

module.exports = { computeRouteRisk };
