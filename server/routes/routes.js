const express = require('express');
const Route = require('../models/Route');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/routes — public
router.get('/', async (req, res, next) => {
  try {
    const routes = await Route.find().sort({ createdAt: 1 });
    res.json(routes);
  } catch (err) {
    next(err);
  }
});

// GET /api/routes/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    next(err);
  }
});

// POST /api/routes — operator only
router.post('/', auth, async (req, res, next) => {
  try {
    const { origin, destination, waypoints, price, estimatedDuration, departureTime } = req.body;
    const route = await Route.create({
      origin,
      destination,
      waypoints,
      price,
      estimatedDuration,
      departureTime,
      operatorId: req.operator.id,
    });
    res.status(201).json(route);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/routes/:id — operator only
router.patch('/:id', auth, async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
