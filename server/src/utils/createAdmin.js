/**
 * Run this script once to create the default admin account.
 * Usage: node src/utils/createAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN = {
  name: 'Super Admin',
  email: 'admin@agrivision.com',
  mobile: '9000000000',
  password: 'Admin@1234',
  role: 'admin',
  loginId: 'AV-A-00001',
  emailVerified: true,
  status: 'active',
};

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log('Admin already exists:');
      console.log('  Email   :', ADMIN.email);
      console.log('  Login ID:', existing.loginId);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN.password, 10);

    await User.create({
      ...ADMIN,
      password: hashed,
    });

    console.log('✅ Admin created successfully!');
    console.log('  Email   :', ADMIN.email);
    console.log('  Login ID:', ADMIN.loginId);
    console.log('  Password:', ADMIN.password);
    console.log('\nChange the password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
