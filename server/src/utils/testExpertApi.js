/**
 * Expert API smoke test — generates a token for the approved expert and
 * hits all /api/expert/* endpoints.
 * Run: node src/utils/testExpertApi.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const http = require('http');
const { generateToken } = require('../utils/generateToken');
const User = require('../models/User');

async function req(path, token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost', port: 5000, path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const ok = res.statusCode === 200 ? '✅' : '❌';
        console.log(`${ok}  ${res.statusCode}  ${path}`);
        resolve();
      });
    });
    r.on('error', (e) => { console.log(`❌  ERR  ${path} — ${e.message}`); resolve(); });
    r.end();
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // Find or use the active expert in DB
  const expert = await User.findOne({ role: 'expert', status: 'active' });
  if (!expert) {
    console.error('No active expert found. Approve an expert via admin panel first.');
    process.exit(1);
  }

  const token = generateToken({ id: expert._id, role: expert.role, status: expert.status });
  console.log(`\nTesting as: ${expert.name} (${expert.loginId})\n`);

  const endpoints = [
    '/api/expert/dashboard',
    '/api/expert/profile',
    '/api/expert/consultation-requests',
    '/api/expert/consultation-requests?status=all',
    '/api/expert/consultations',
    '/api/expert/farmers',
    '/api/expert/disease-cases',
    '/api/expert/crop-advice',
    '/api/expert/notifications',
    '/api/expert/knowledge',
    '/api/expert/knowledge?type=scheme',
  ];

  for (const path of endpoints) {
    await req(path, token);
  }

  // Also verify a pending expert is BLOCKED
  const pending = await User.findOne({ role: 'expert', status: 'pending' });
  if (pending) {
    const pendingToken = generateToken({ id: pending._id, role: pending.role, status: pending.status });
    console.log('\n--- Access control check (pending expert should be blocked) ---');
    await req('/api/expert/dashboard', pendingToken);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error(e.message); process.exit(1); });
