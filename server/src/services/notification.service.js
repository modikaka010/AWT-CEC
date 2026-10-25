const User = require('../models/User');
const Notification = require('../models/Notification');

const notifyAdmins = async ({ type, title, message, link = null }) => {
  try {
    const admins = await User.find({ role: 'admin', status: 'active' }).select('_id').lean();
    if (!admins.length) return;

    await Notification.insertMany(admins.map(({ _id }) => ({
      recipient: _id,
      type,
      title,
      message,
      link,
    })));
  } catch (err) {
    console.error('Admin notification creation failed:', err.message);
  }
};

module.exports = { notifyAdmins };
