require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({ role: { $in: ['farmer', 'buyer'] } })
    .select('-__v')
    .lean();

  if (users.length === 0) {
    console.log('No farmer or buyer accounts found yet.');
  } else {
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach(u => {
      console.log(`Role    : ${u.role}`);
      console.log(`Name    : ${u.name}`);
      console.log(`Email   : ${u.email}`);
      console.log(`Mobile  : ${u.mobile}`);
      console.log(`LoginId : ${u.loginId}`);
      console.log(`Status  : ${u.status}`);
      console.log(`Created : ${u.createdAt}`);
      console.log('─'.repeat(40));
    });
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
