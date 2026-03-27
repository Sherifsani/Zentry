const express = require('express');
const Bus = require('../models/Bus');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/buses — operator auth, own fleet
router.get('/', auth, async (req, res, next) => {
  try {
    const buses = await Bus.find({ operatorId: req.operator.id })
      .populate('currentRouteId', 'origin destination waypoints');
    res.json(buses);
  } catch (err) {
    next(err);
  }
});

// GET /api/buses/:id — operator auth
router.get('/:id', auth, async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('currentRouteId', 'origin destination waypoints price');
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    next(err);
  }
});

// POST /api/buses — operator auth
router.post('/', auth, async (req, res, next) => {
  try {
    const { plateNumber, driverName, currentRouteId } = req.body;
    const bus = await Bus.create({
      plateNumber,
      driverName,
      operatorId: req.operator.id,
      currentRouteId: currentRouteId || undefined,
    });
    res.status(201).json(bus);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/buses/:id — operator auth
router.patch('/:id', auth, async (req, res, next) => {
  try {
    const bus = await Bus.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.operator.id },
      req.body,
      { new: true }
    );
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
