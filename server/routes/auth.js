const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Operator = require('../models/Operator');
const Passenger = require('../models/Passenger');
const auth = require('../middleware/auth');

const router = express.Router();

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register/operator
router.post('/register/operator', async (req, res, next) => {
  try {
    const { companyName, email, phone, password, rcNumber, address } = req.body;

    if (!companyName || !email || !password || !phone) {
      return res.status(400).json({ error: 'Company name, email, phone and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await Operator.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const operator = await Operator.create({
      companyName,
      email,
      phone,
      rcNumber,
      address,
      passwordHash,
      status: 'verified', // auto-verify for hackathon
    });

    const token = signToken({
      id: operator._id,
      email: operator.email,
      companyName: operator.companyName,
      role: 'operator',
    });

    res.status(201).json({
      token,
      role: 'operator',
      operator: {
        id: operator._id,
        email: operator.email,
        companyName: operator.companyName,
        status: operator.status,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register/passenger
router.post('/register/passenger', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await Passenger.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const passenger = await Passenger.create({ name, email, phone, passwordHash });

    const token = signToken({
      id: passenger._id,
      email: passenger.email,
      name: passenger.name,
      role: 'passenger',
    });

    res.status(201).json({
      token,
      role: 'passenger',
      passenger: {
        id: passenger._id,
        email: passenger.email,
        name: passenger.name,
        phone: passenger.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — unified login, checks role param
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Determine where to look — if role is provided use it, otherwise try both
    const tryOperator = !role || role === 'operator';
    const tryPassenger = !role || role === 'passenger';

    if (tryOperator) {
      const operator = await Operator.findOne({ email: email.toLowerCase() });
      if (operator) {
        const match = await operator.comparePassword(password);
        if (!match) return res.status(401).json({ error: 'Incorrect password' });

        const token = signToken({
          id: operator._id,
          email: operator.email,
          companyName: operator.companyName,
          role: 'operator',
        });

        return res.json({
          token,
          role: 'operator',
          operator: {
            id: operator._id,
            email: operator.email,
            companyName: operator.companyName,
            status: operator.status,
          },
        });
      }
    }

    if (tryPassenger) {
      const passenger = await Passenger.findOne({ email: email.toLowerCase() });
      if (passenger) {
        const match = await passenger.comparePassword(password);
        if (!match) return res.status(401).json({ error: 'Incorrect password' });

        const token = signToken({
          id: passenger._id,
          email: passenger.email,
          name: passenger.name,
          role: 'passenger',
        });

        return res.json({
          token,
          role: 'passenger',
          passenger: {
            id: passenger._id,
            email: passenger.email,
            name: passenger.name,
            phone: passenger.phone,
          },
        });
      }
    }

    return res.status(401).json({ error: 'No account found with this email' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const { role, id } = req.operator; // req.operator holds decoded JWT regardless of role
    if (role === 'operator') {
      const op = await Operator.findById(id).select('-passwordHash');
      return res.json({ role: 'operator', ...op.toObject() });
    }
    if (role === 'passenger') {
      const p = await Passenger.findById(id).select('-passwordHash');
      return res.json({ role: 'passenger', ...p.toObject() });
    }
    res.status(404).json({ error: 'User not found' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
