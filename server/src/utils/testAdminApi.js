/**
 * Quick smoke-test for admin routes.
 * Run: node src/utils/testAdminApi.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { generateToken } = require('../utils/generateToken');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) { console.error('No admin found. Run createAdmin.js first.'); process.exit(1); }

  const token = generateToken({ id: admin._id, role: admin.role, status: admin.status });

  const http = require('http');
  const endpoints = [
    '/api/admin/dashboard',
    '/api/admin/analytics',
    '/api/admin/users?role=farmer',
    '/api/admin/experts/requests',
    '/api/admin/products',
    '/api/admin/orders',
    '/api/admin/reports',
    '/api/admin/notifications',
    '/api/content/news',
    '/api/content/schemes',
  ];

  for (const path of endpoints) {
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost', port: 5000, path, method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          const ok = res.statusCode === 200 ? '✅' : '❌';
          console.log(`${ok}  ${res.statusCode}  ${path}`);
          resolve();
        });
      });
      req.on('error', (e) => { console.log(`❌  ERR  ${path} — ${e.message}`); resolve(); });
      req.end();
    });
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error(e.message); process.exit(1); });
