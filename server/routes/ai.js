const express = require('express');
const Route = require('../models/Route');
const { computeRouteRisk } = require('../services/riskScoring');

const router = express.Router();

// GET /api/routes/:id/risk
router.get('/routes/:id/risk', async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    const { score, summary } = await computeRouteRisk(route);
    res.json({ score, summary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
