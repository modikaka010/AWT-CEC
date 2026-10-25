require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Otp = require('../models/Otp');
const ExpertRequest = require('../models/ExpertRequest');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('\n========== DATABASE: configured MongoDB database ==========\n');

  // Users by role
  const roles = ['admin', 'farmer', 'buyer', 'expert'];
  for (const role of roles) {
    const users = await User.find({ role }).select('-__v -password').lean();
    console.log(`\n📁 COLLECTION: users  |  role = ${role.toUpperCase()}  (${users.length} records)`);
    console.log('─'.repeat(60));
    users.forEach(u => {
      console.log(`  Name    : ${u.name}`);
      console.log(`  Email   : ${u.email}`);
      console.log(`  Mobile  : ${u.mobile || '—'}`);
      console.log(`  LoginId : ${u.loginId || '—'}`);
      console.log(`  Status  : ${u.status}`);
      console.log(`  Created : ${u.createdAt}`);
      console.log('  ' + '·'.repeat(50));
    });
  }

  // OTPs
  const otps = await Otp.find().select('-__v -otp').lean();
  console.log(`\n📁 COLLECTION: otps  (${otps.length} active records)`);
  console.log('─'.repeat(60));
  otps.forEach(o => {
    console.log(`  Email   : ${o.email}`);
    console.log(`  Purpose : ${o.purpose}`);
    console.log(`  Expires : ${o.expiresAt}`);
    console.log(`  Verified: ${o.verified}`);
    console.log('  ' + '·'.repeat(50));
  });

  // Expert Requests
  const requests = await ExpertRequest.find().select('-__v').lean();
  console.log(`\n📁 COLLECTION: expertrequests  (${requests.length} records)`);
  console.log('─'.repeat(60));
  requests.forEach(r => {
    console.log(`  Name    : ${r.name}`);
    console.log(`  Email   : ${r.email}`);
    console.log(`  Status  : ${r.status}`);
    console.log(`  Spec.   : ${r.specialization || '—'}`);
    console.log('  ' + '·'.repeat(50));
  });

  console.log('\n==========================================\n');
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
