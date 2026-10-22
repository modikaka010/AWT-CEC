/**
 * Buyer API smoke test.
 * Run: node src/utils/testBuyerApi.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const http = require('http');
const { generateToken } = require('../utils/generateToken');
const User = require('../models/User');

async function req(path, token) {
  return new Promise((resolve) => {
    const opts = { hostname: 'localhost', port: 5000, path, method: 'GET', headers: { Authorization: `Bearer ${token}` } };
    const r = http.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { console.log(`${res.statusCode === 200 ? '✅' : '❌'}  ${res.statusCode}  ${path}`); resolve(); });
    });
    r.on('error', (e) => { console.log(`❌  ERR  ${path} — ${e.message}`); resolve(); });
    r.end();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const buyer = await User.findOne({ role: 'buyer', status: 'active' });
  if (!buyer) { console.error('No active buyer found. Register a buyer first.'); process.exit(1); }

  const token = generateToken({ id: buyer._id, role: buyer.role, status: buyer.status });
  console.log(`\nTesting as: ${buyer.name} (${buyer.loginId})\n`);

  const endpoints = [
    '/api/buyer/dashboard',
    '/api/buyer/profile',
    '/api/buyer/marketplace',
    '/api/buyer/marketplace/farmers',
    '/api/buyer/cart',
    '/api/buyer/orders',
    '/api/buyer/chat/conversations',
    '/api/buyer/notifications',
  ];

  for (const path of endpoints) await req(path, token);

  // Verify a farmer CANNOT access buyer routes
  const farmer = await User.findOne({ role: 'farmer', status: 'active' });
  if (farmer) {
    const farmerToken = generateToken({ id: farmer._id, role: farmer.role, status: farmer.status });
    console.log('\n--- Access control (farmer should be blocked from buyer API) ---');
    await req('/api/buyer/dashboard', farmerToken);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error(e.message); process.exit(1); });
