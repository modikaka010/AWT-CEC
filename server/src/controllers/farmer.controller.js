const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Negotiation = require('../models/Negotiation');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { findState } = require('../data/indiaStates');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/dashboard
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const [
      totalProducts,
      activeProducts,
      soldProducts,
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      activeNegotiations,
      unreadMessages,
      unreadNotifications,
      recentOrders,
      recentNegotiations,
      revenueAgg,
    ] = await Promise.all([
      Product.countDocuments({ farmer: farmerId }),
      Product.countDocuments({ farmer: farmerId, status: 'active' }),
      Product.countDocuments({ farmer: farmerId, status: 'sold' }),
      Order.countDocuments({ farmer: farmerId }),
      Order.countDocuments({ farmer: farmerId, status: 'pending' }),
      Order.countDocuments({ farmer: farmerId, status: { $in: ['confirmed', 'processing', 'shipped'] } }),
      Order.countDocuments({ farmer: farmerId, status: 'delivered' }),
      Order.countDocuments({ farmer: farmerId, status: 'cancelled' }),
      Negotiation.countDocuments({ farmer: farmerId, status: { $in: ['pending', 'countered'] } }),
      Message.countDocuments({ receiver: farmerId, isRead: false }),
      Notification.countDocuments({ recipient: farmerId, isRead: false }),
      Order.find({ farmer: farmerId })
        .populate('buyer', 'name loginId')
        .select('buyer totalAmount status createdAt items')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Negotiation.find({ farmer: farmerId })
        .populate('buyer', 'name loginId')
        .select('buyer productName currentPrice currentQuantity status updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        { $match: { farmer: new (require('mongoose').Types.ObjectId)(farmerId), status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueAgg?.[0]?.total || 0;

    return sendSuccess(res, 200, 'Dashboard stats fetched.', {
      stats: {
        totalProducts,
        activeProducts,
        soldProducts,
        totalOrders,
        pendingOrders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        activeNegotiations,
        unreadMessages,
        unreadNotifications,
        totalRevenue,
      },
      recentOrders,
      recentNegotiations,
    });
  } catch (err) {
    console.error('farmer getDashboardStats error:', err);
    return sendError(res, 500, 'Failed to load dashboard.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/profile
// ─────────────────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const farmer = await User.findById(req.user.id).select('-__v -password').lean();
    if (!farmer) return sendError(res, 404, 'Farmer not found.');
    return sendSuccess(res, 200, 'Profile fetched.', { farmer });
  } catch (err) {
    console.error('farmer getProfile error:', err);
    return sendError(res, 500, 'Failed to fetch profile.');
  }
};

// PATCH /api/farmer/profile
const updateProfile = async (req, res) => {
  try {
    const { name, mobile, state, district } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (mobile?.trim()) updates.mobile = mobile.trim();

    // Home location (used as the default for Weather Advisory). Send both, or both empty to clear.
    if (state !== undefined || district !== undefined) {
      const st = typeof state === 'string' ? state.trim() : '';
      const di = typeof district === 'string' ? district.trim() : '';
      if (!st && !di) {
        updates['location.state'] = null;
        updates['location.district'] = null;
      } else {
        const canonical = findState(st);
        if (!canonical) return sendError(res, 400, 'Please choose a valid Indian state or union territory.');
        if (!/^[\p{L}\p{M}\p{N}\s.,'()-]{2,100}$/u.test(di)) return sendError(res, 400, 'Please enter a valid district name.');
        updates['location.state'] = canonical.name;
        updates['location.district'] = di;
      }
    }
    if (Object.keys(updates).length === 0)
      return sendError(res, 400, 'No valid fields to update.');

    const farmer = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true, runValidators: true,
    }).select('-__v -password');

    return sendSuccess(res, 200, 'Profile updated.', { farmer });
  } catch (err) {
    console.error('farmer updateProfile error:', err);
    return sendError(res, 500, 'Failed to update profile.');
  }
};

// PATCH /api/farmer/profile/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return sendError(res, 400, 'Both current and new password are required.');
    if (newPassword.length < 8)
      return sendError(res, 400, 'New password must be at least 8 characters.');

    const farmer = await User.findById(req.user.id).select('+password');
    if (!farmer) return sendError(res, 404, 'Farmer not found.');

    const isMatch = await comparePassword(currentPassword, farmer.password);
    if (!isMatch) return sendError(res, 401, 'Current password is incorrect.');

    farmer.password = await hashPassword(newPassword);
    await farmer.save();
    return sendSuccess(res, 200, 'Password changed successfully.');
  } catch (err) {
    console.error('farmer changePassword error:', err);
    return sendError(res, 500, 'Failed to change password.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// GET /api/farmer/notifications?page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments({ recipient: req.user.id }),
      Notification.countDocuments({ recipient: req.user.id, isRead: false }),
    ]);

    return sendSuccess(res, 200, 'Notifications fetched.', {
      notifications,
      unreadCount,
      pagination: {
        total, page: parseInt(page), limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('farmer getNotifications error:', err);
    return sendError(res, 500, 'Failed to fetch notifications.');
  }
};

// PATCH /api/farmer/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!n) return sendError(res, 404, 'Notification not found.');
    return sendSuccess(res, 200, 'Notification marked as read.', { notification: n });
  } catch (err) {
    return sendError(res, 500, 'Failed to mark notification.');
  }
};

// PATCH /api/farmer/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return sendSuccess(res, 200, 'All notifications marked as read.');
  } catch (err) {
    return sendError(res, 500, 'Failed to mark all notifications.');
  }
};

module.exports = {
  getDashboardStats, getProfile, updateProfile, changePassword,
  getNotifications, markNotificationRead, markAllNotificationsRead,
};
