const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { hashPassword, comparePassword } = require('../utils/hashPassword');

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// GET /api/buyer/dashboard
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const [
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      cartData,
      unreadMessages,
      unreadNotifications,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments({ buyer: buyerId }),
      Order.countDocuments({ buyer: buyerId, status: 'pending' }),
      Order.countDocuments({ buyer: buyerId, status: { $in: ['confirmed', 'processing', 'shipped'] } }),
      Order.countDocuments({ buyer: buyerId, status: 'delivered' }),
      Order.countDocuments({ buyer: buyerId, status: 'cancelled' }),
      Cart.findOne({ buyer: buyerId }).select('items').lean(),
      Message.countDocuments({ receiver: buyerId, isRead: false }),
      Notification.countDocuments({ recipient: buyerId, isRead: false }),
      Order.find({ buyer: buyerId })
        .populate('farmer', 'name')
        .select('farmer totalAmount status createdAt items')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return sendSuccess(res, 200, 'Dashboard stats fetched.', {
      stats: {
        totalOrders,
        pendingOrders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        cartItems: cartData?.items?.length || 0,
        unreadMessages,
        unreadNotifications,
      },
      recentOrders,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return sendError(res, 500, 'Failed to load dashboard.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// GET /api/buyer/profile
// ─────────────────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const buyer = await User.findById(req.user.id).select('-__v -password').lean();
    if (!buyer) return sendError(res, 404, 'Buyer not found.');
    return sendSuccess(res, 200, 'Profile fetched.', { buyer });
  } catch (err) {
    console.error('getProfile error:', err);
    return sendError(res, 500, 'Failed to fetch profile.');
  }
};

// PATCH /api/buyer/profile
// Body: { name, mobile, address }
const updateProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (mobile?.trim()) updates.mobile = mobile.trim();
    if (Object.keys(updates).length === 0)
      return sendError(res, 400, 'No valid fields to update.');

    const buyer = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true, runValidators: true,
    }).select('-__v -password');

    return sendSuccess(res, 200, 'Profile updated.', { buyer });
  } catch (err) {
    console.error('updateProfile error:', err);
    return sendError(res, 500, 'Failed to update profile.');
  }
};

// PATCH /api/buyer/profile/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return sendError(res, 400, 'Both current and new password are required.');
    if (newPassword.length < 8)
      return sendError(res, 400, 'New password must be at least 8 characters.');

    const buyer = await User.findById(req.user.id).select('+password');
    if (!buyer) return sendError(res, 404, 'Buyer not found.');

    const isMatch = await comparePassword(currentPassword, buyer.password);
    if (!isMatch) return sendError(res, 401, 'Current password is incorrect.');

    buyer.password = await hashPassword(newPassword);
    await buyer.save();
    return sendSuccess(res, 200, 'Password changed successfully.');
  } catch (err) {
    console.error('changePassword error:', err);
    return sendError(res, 500, 'Failed to change password.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// GET /api/buyer/notifications?page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const buyerId = req.user.id;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: buyerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v')
        .lean(),
      Notification.countDocuments({ recipient: buyerId }),
      Notification.countDocuments({ recipient: buyerId, isRead: false }),
    ]);

    return sendSuccess(res, 200, 'Notifications fetched.', {
      notifications, unreadCount,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return sendError(res, 500, 'Failed to fetch notifications.');
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notif) return sendError(res, 404, 'Notification not found.');
    notif.isRead = true; notif.readAt = new Date();
    await notif.save();
    return sendSuccess(res, 200, 'Notification marked as read.');
  } catch (err) { return sendError(res, 500, 'Failed to mark notification.'); }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return sendSuccess(res, 200, 'All notifications marked as read.');
  } catch (err) { return sendError(res, 500, 'Failed to mark notifications.'); }
};

module.exports = {
  getDashboardStats, getProfile, updateProfile, changePassword,
  getNotifications, markNotificationRead, markAllNotificationsRead,
};
