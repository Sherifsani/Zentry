require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Operator = require('../models/Operator');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Incident = require('../models/Incident');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 5 });
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Operator.deleteMany({}),
    Route.deleteMany({}),
    Bus.deleteMany({}),
    Incident.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create operator
  const passwordHash = await bcrypt.hash('SafeTrack2026', 12);
  const operator = await Operator.create({
    email: 'demo@safetrack.ng',
    passwordHash,
    companyName: 'GIG Motors',
  });
  console.log(`Operator created: ${operator.email}`);

  // Create routes
  const routes = await Route.insertMany([
    {
      origin: 'Abuja',
      destination: 'Lagos',
      departureTime: '07:00',
      price: 12000,
      estimatedDuration: 540, // 9 hours
      operatorId: operator._id,
      riskScore: 'High',
      riskSummary: '5 incidents reported on this corridor this month — exercise caution.',
      riskSummaryUpdatedAt: new Date(),
      waypoints: [
        { name: 'Abuja (Utako Park)', lat: 9.0765, lng: 7.3986 },
        { name: 'Lokoja', lat: 7.8036, lng: 6.7376 },
        { name: 'Okene', lat: 7.5464, lng: 6.2376 },
        { name: 'Ore', lat: 6.9773, lng: 4.8610 },
        { name: 'Sagamu', lat: 6.8355, lng: 3.6476 },
        { name: 'Lagos (Jibowu)', lat: 6.5244, lng: 3.3792 },
      ],
    },
    {
      origin: 'Lagos',
      destination: 'Abuja',
      departureTime: '06:00',
      price: 12000,
      estimatedDuration: 540,
      operatorId: operator._id,
      riskScore: 'Medium',
      riskSummary: '2 incidents reported on this route in the last 30 days.',
      riskSummaryUpdatedAt: new Date(),
      waypoints: [
        { name: 'Lagos (Jibowu)', lat: 6.5244, lng: 3.3792 },
        { name: 'Sagamu', lat: 6.8355, lng: 3.6476 },
        { name: 'Ore', lat: 6.9773, lng: 4.8610 },
        { name: 'Okene', lat: 7.5464, lng: 6.2376 },
        { name: 'Lokoja', lat: 7.8036, lng: 6.7376 },
        { name: 'Abuja (Utako Park)', lat: 9.0765, lng: 7.3986 },
      ],
    },
    {
      origin: 'Lagos',
      destination: 'Port Harcourt',
      departureTime: '08:00',
      price: 9500,
      estimatedDuration: 360, // 6 hours
      operatorId: operator._id,
      riskScore: 'Low',
      riskSummary: 'No incidents reported on this route in the last 30 days.',
      riskSummaryUpdatedAt: new Date(),
      waypoints: [
        { name: 'Lagos (Mile 2)', lat: 6.4698, lng: 3.3080 },
        { name: 'Benin City', lat: 6.3350, lng: 5.6270 },
        { name: 'Warri', lat: 5.5167, lng: 5.7500 },
        { name: 'Port Harcourt (Mile 3)', lat: 4.8156, lng: 7.0498 },
      ],
    },
  ]);
  console.log(`Routes created: ${routes.map((r) => `${r.origin}→${r.destination}`).join(', ')}`);

  // Create buses
  const buses = await Bus.insertMany([
    {
      plateNumber: 'ABJ-001-GIG',
      driverName: 'Chidi Okonkwo',
      operatorId: operator._id,
      currentRouteId: routes[0]._id,
      status: 'idle',
      lastLocation: { lat: 9.0765, lng: 7.3986 },
      lastPingAt: new Date(),
    },
    {
      plateNumber: 'LOS-002-GIG',
      driverName: 'Tunde Adebayo',
      operatorId: operator._id,
      currentRouteId: routes[1]._id,
      status: 'idle',
      lastLocation: { lat: 6.5244, lng: 3.3792 },
      lastPingAt: new Date(),
    },
    {
      plateNumber: 'LOS-003-GIG',
      driverName: 'Emeka Nwosu',
      operatorId: operator._id,
      currentRouteId: routes[2]._id,
      status: 'idle',
      lastLocation: { lat: 6.4698, lng: 3.3080 },
      lastPingAt: new Date(),
    },
  ]);
  console.log(`Buses created: ${buses.map((b) => b.plateNumber).join(', ')}`);

  // Seed historical incidents to drive risk scores
  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  await Incident.insertMany([
    // Abuja-Lagos (High): 5 incidents
    { routeId: routes[0]._id, operatorId: operator._id, type: 'armed-attack', source: 'passenger', gps: { lat: 7.8, lng: 6.7 }, status: 'resolved', createdAt: thirtyDaysAgo },
    { routeId: routes[0]._id, operatorId: operator._id, type: 'suspicious-stop', source: 'ai', gps: { lat: 7.5, lng: 6.2 }, status: 'resolved', createdAt: twentyDaysAgo },
    { routeId: routes[0]._id, operatorId: operator._id, type: 'route-deviation', source: 'ai', gps: { lat: 7.0, lng: 5.0 }, status: 'resolved', createdAt: tenDaysAgo },
    { routeId: routes[0]._id, operatorId: operator._id, type: 'accident', source: 'passenger', gps: { lat: 6.98, lng: 4.86 }, status: 'resolved', createdAt: fiveDaysAgo },
    { routeId: routes[0]._id, operatorId: operator._id, type: 'feeling-unsafe', source: 'passenger', gps: { lat: 7.2, lng: 5.5 }, status: 'resolved', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    // Lagos-Abuja (Medium): 2 incidents
    { routeId: routes[1]._id, operatorId: operator._id, type: 'suspicious-stop', source: 'ai', gps: { lat: 7.0, lng: 5.5 }, status: 'resolved', createdAt: twentyDaysAgo },
    { routeId: routes[1]._id, operatorId: operator._id, type: 'feeling-unsafe', source: 'passenger', gps: { lat: 7.5, lng: 6.0 }, status: 'resolved', createdAt: tenDaysAgo },
    // Lagos-PH (Low): 0 incidents — none seeded
  ]);
  console.log('Historical incidents seeded');

  console.log('\n✓ Seed complete!');
  console.log('  Operator login: demo@safetrack.ng / SafeTrack2026');
  console.log(`  Routes: ${routes.length}`);
  console.log(`  Buses: ${buses.length}`);
  console.log(`  Bus IDs for GPS simulation:`);
  buses.forEach((b) => console.log(`    ${b.plateNumber}: ${b._id}`));

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
