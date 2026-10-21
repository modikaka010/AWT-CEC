/**
 * Farmer API smoke test
 * node src/utils/testFarmerApi.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const http = require('http');
const { generateToken } = require('../utils/generateToken');
const User = require('../models/User');

async function req(path, token, label) {
  return new Promise((resolve) => {
    const opts = { hostname:'localhost', port:5000, path, method:'GET', headers:{ Authorization:`Bearer ${token}` } };
    const r = http.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        const ok = res.statusCode >= 200 && res.statusCode < 300;
        console.log(`${ok ? '✅' : '❌'}  ${res.statusCode}  ${label || path}`);
        resolve();
      });
    });
    r.on('error', (e) => { console.log(`❌  ERR  ${path} — ${e.message}`); resolve(); });
    r.end();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const farmer = await User.findOne({ role:'farmer', status:'active' });
  if (!farmer) { console.error('No active farmer found.'); process.exit(1); }

  const farmerToken = generateToken({ id:farmer._id, role:farmer.role, status:farmer.status });
  console.log(`\nTesting as farmer: ${farmer.name} (${farmer.loginId})\n`);

  await req('/api/farmer/dashboard',            farmerToken);
  await req('/api/farmer/profile',              farmerToken);
  await req('/api/farmer/products',             farmerToken);
  await req('/api/farmer/products/categories',  farmerToken);
  await req('/api/farmer/orders',               farmerToken);
  await req('/api/farmer/analytics',            farmerToken);
  await req('/api/farmer/chat/conversations',   farmerToken);
  await req('/api/farmer/notifications',        farmerToken);

  console.log('\n--- Access control ---');
  const buyer = await User.findOne({ role:'buyer', status:'active' });
  if (buyer) {
    const buyerToken = generateToken({ id:buyer._id, role:buyer.role, status:buyer.status });
    await req('/api/farmer/dashboard', buyerToken, 'buyer→farmer/dashboard (should 403)');
    await req('/api/buyer/dashboard',  farmerToken, 'farmer→buyer/dashboard (should 403)');
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error(e.message); process.exit(1); });
