const User = require('../models/User');
const ExpertRequest = require('../models/ExpertRequest');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Consultation = require('../models/Consultation');
const DiseaseCase = require('../models/DiseaseCase');
const CropAdvice = require('../models/CropAdvice');
const { sendExpertApprovedEmail, sendExpertRejectedEmail } = require('../services/email.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — create a notification record
// ─────────────────────────────────────────────────────────────────────────────
const createNotification = async ({ recipient = null, type, title, message, link = null }) => {
  try {
    await Notification.create({ recipient, type, title, message, link });
  } catch (e) {
    console.error('Notification creation failed:', e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// GET /api/admin/dashboard
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalFarmers,
      totalBuyers,
      totalExperts,
      pendingExperts,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      pendingReports,
      totalReports,
      unreadNotifications,
      recentUsers,
      recentOrders,
      pendingConsultations,
      activeConsultations,
      completedConsultations,
      pendingDiseaseCases,
      totalCropAdvice,
    ] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'expert' }),
      User.countDocuments({ role: 'expert', status: 'pending' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments(),
      Notification.countDocuments({
        $or: [
          { recipient: req.user.id, isRead: false },
          { recipient: null, isRead: false, readBy: { $ne: req.user.id } },
        ],
      }),
      User.find({ role: { $in: ['farmer', 'buyer', 'expert'] } })
        .select('name email role status createdAt loginId')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.find()
        .select('buyer farmer totalAmount status createdAt')
        .populate('buyer', 'name')
        .populate('farmer', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Consultation.countDocuments({ status: 'pending' }),
      Consultation.countDocuments({ status: 'accepted' }),
      Consultation.countDocuments({ status: 'completed' }),
      DiseaseCase.countDocuments({ status: 'pending' }),
      CropAdvice.countDocuments(),
    ]);

    return sendSuccess(res, 200, 'Dashboard stats fetched.', {
      stats: {
        totalFarmers,
        totalBuyers,
        totalExperts,
        pendingExperts,
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        pendingReports,
        totalReports,
        unreadNotifications,
        pendingConsultations,
        activeConsultations,
        completedConsultations,
        pendingDiseaseCases,
        totalCropAdvice,
      },
      recentUsers,
      recentOrders,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return sendError(res, 500, 'Failed to fetch dashboard stats.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// GET /api/admin/analytics
// ─────────────────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const parseDate = (value, fallback) => {
      if (value === undefined) return fallback;
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? null : parsed;
    };
    const now = new Date();
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const defaultFrom = new Date(defaultTo);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
    const from = parseDate(req.query.from, defaultFrom);
    const toDate = parseDate(req.query.to, defaultTo);
    if (!from || !toDate) return sendError(res, 400, 'Dates must use the YYYY-MM-DD format.');
    if (from > toDate) return sendError(res, 400, 'Start date must be on or before end date.');
    if (toDate.getTime() - from.getTime() > 3660 * 24 * 60 * 60 * 1000) {
      return sendError(res, 400, 'Date range cannot exceed 10 years.');
    }

    const to = new Date(toDate);
    to.setUTCDate(to.getUTCDate() + 1);
    const range = { $gte: from, $lt: to };
    const daysInRange = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
    const periodFormat = daysInRange <= 90 ? '%Y-%m-%d' : '%Y-%m';
    const groupByPeriod = (dateField = '$createdAt') => ({
      $dateToString: { format: periodFormat, date: dateField, timezone: 'UTC' },
    });
    const toObj = (arr) => arr.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    const [
      userStatusRows,
      registrationRows,
      productRows,
      orderRows,
      orderTrend,
      expertRows,
      reportRows,
      consultationRows,
      diseaseCaseRows,
      cropAdviceRows,
      activeFarmerProducts,
      activeFarmerOrders,
      activeBuyerOrders,
    ] = await Promise.all([
      User.aggregate([
        { $group: { _id: { role: '$role', status: '$status' }, count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { createdAt: range, role: { $in: ['farmer', 'buyer', 'expert'] } } },
        { $group: { _id: { period: groupByPeriod(), role: '$role' }, count: { $sum: 1 } } },
        { $sort: { '_id.period': 1 } },
      ]),
      Product.aggregate([
        { $match: { createdAt: range } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: range } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            orderValue: { $sum: '$totalAmount' },
            deliveredRevenue: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: range } },
        {
          $group: {
            _id: groupByPeriod(),
            orders: { $sum: 1 },
            revenue: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ExpertRequest.aggregate([
        { $match: { createdAt: range } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Report.aggregate([
        { $match: { createdAt: range } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Consultation.aggregate([
        { $match: { createdAt: range } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      DiseaseCase.aggregate([
        { $match: { createdAt: range } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      CropAdvice.aggregate([
        { $match: { createdAt: range } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Product.distinct('farmer', { createdAt: range, status: { $in: ['active', 'sold'] } }),
      Order.distinct('farmer', { createdAt: range, status: { $ne: 'cancelled' } }),
      Order.distinct('buyer', { createdAt: range, status: { $ne: 'cancelled' } }),
    ]);

    const userStatus = {};
    userStatusRows.forEach(({ _id, count }) => {
      userStatus[_id.role] ||= {};
      userStatus[_id.role][_id.status] = count;
    });
    const userDistribution = Object.fromEntries(
      ['farmer', 'buyer', 'expert', 'admin'].map((role) => [
        role === 'farmer' ? 'farmers' : role === 'buyer' ? 'buyers' : `${role}s`,
        Object.values(userStatus[role] || {}).reduce((sum, count) => sum + count, 0),
      ])
    );
    const registrationsByRole = {};
    registrationRows.forEach(({ _id, count }) => {
      registrationsByRole[_id.role] ||= {};
      registrationsByRole[_id.role][_id.period] = count;
    });
    const orderStats = {};
    const revenue = orderRows.reduce((sum, row) => {
      orderStats[row._id] = row.count;
      return sum + row.deliveredRevenue;
    }, 0);

    return sendSuccess(res, 200, 'Analytics fetched.', {
      generatedAt: new Date(),
      dateRange: { from: from.toISOString().slice(0, 10), to: toDate.toISOString().slice(0, 10) },
      userDistribution,
      userStatus,
      registrationsByRole,
      registrationTrend: registrationRows.map(({ _id, count }) => ({
        period: _id.period,
        role: _id.role,
        count,
      })),
      farmerBuyerActivity: {
        activeFarmers: new Set([...activeFarmerProducts, ...activeFarmerOrders].map(String)).size,
        activeBuyers: new Set(activeBuyerOrders.map(String)).size,
      },
      productStats: toObj(productRows),
      orderStats,
      orderTrend: orderTrend.map(({ _id, orders, revenue: periodRevenue }) => ({
        period: _id,
        orders,
        revenue: periodRevenue,
      })),
      revenue: {
        amount: revenue,
        currency: 'INR',
        basis: 'Total value of delivered orders in selected period',
      },
      expertStats: toObj(expertRows),
      reportStats: toObj(reportRows),
      consultationStats: toObj(consultationRows),
      diseaseCaseStats: toObj(diseaseCaseRows),
      cropAdviceStats: toObj(cropAdviceRows),
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return sendError(res, 500, 'Failed to fetch analytics.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/users?role=farmer&status=active&search=raj&page=1&limit=20
const getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { loginId: regex }, { mobile: regex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-__v -password -expertInfo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Users fetched.', {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getUsers error:', err);
    return sendError(res, 500, 'Failed to fetch users.');
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v -password').lean();
    if (!user) return sendError(res, 404, 'User not found.');

    // Fetch additional counts based on role
    let extra = {};
    if (user.role === 'farmer') {
      const [productCount, orderCount] = await Promise.all([
        Product.countDocuments({ farmer: user._id }),
        Order.countDocuments({ farmer: user._id }),
      ]);
      extra = { productCount, orderCount };
    } else if (user.role === 'buyer') {
      const orderCount = await Order.countDocuments({ buyer: user._id });
      extra = { orderCount };
    } else if (user.role === 'expert') {
      const expertRequest = await ExpertRequest.findOne({ user: user._id })
        .select('-__v')
        .lean();
      extra = { expertRequest };
    }

    return sendSuccess(res, 200, 'User fetched.', { user, ...extra });
  } catch (err) {
    console.error('getUserById error:', err);
    return sendError(res, 500, 'Failed to fetch user.');
  }
};

// PATCH /api/admin/users/:id/status
// Body: { status: 'active' | 'suspended' }
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'suspended'];
    if (!status || !allowed.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${allowed.join(', ')}.`);
    }

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found.');
    if (user.role === 'admin') return sendError(res, 403, 'Cannot modify another admin account.');

    user.status = status;
    await user.save();

    await createNotification({
      recipient: user._id,
      type: 'system',
      title: status === 'active' ? 'Account Activated' : 'Account Suspended',
      message:
        status === 'active'
          ? 'Your account has been activated by the admin.'
          : 'Your account has been suspended. Please contact support.',
    });

    return sendSuccess(res, 200, `User ${status === 'active' ? 'activated' : 'suspended'} successfully.`, {
      user: { id: user._id, name: user.name, status: user.status },
    });
  } catch (err) {
    console.error('updateUserStatus error:', err);
    return sendError(res, 500, 'Failed to update user status.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPERT VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/experts/requests?status=pending&page=1&limit=20
const getExpertRequests = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status !== 'all') filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      ExpertRequest.find(filter)
        .populate('user', 'name email mobile status loginId createdAt')
        .populate('reviewedBy', 'name')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ExpertRequest.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Expert requests fetched.', {
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getExpertRequests error:', err);
    return sendError(res, 500, 'Failed to fetch expert requests.');
  }
};

// GET /api/admin/experts/requests/:id
const getExpertRequestById = async (req, res) => {
  try {
    const request = await ExpertRequest.findById(req.params.id)
      .populate('user', 'name email mobile status loginId createdAt expertInfo')
      .populate('reviewedBy', 'name email')
      .select('-__v')
      .lean();

    if (!request) return sendError(res, 404, 'Expert request not found.');

    return sendSuccess(res, 200, 'Expert request fetched.', { request });
  } catch (err) {
    console.error('getExpertRequestById error:', err);
    return sendError(res, 500, 'Failed to fetch expert request.');
  }
};

// PATCH /api/admin/experts/requests/:id/approve
const approveExpert = async (req, res) => {
  try {
    const request = await ExpertRequest.findById(req.params.id).populate('user');
    if (!request) return sendError(res, 404, 'Expert request not found.');
    if (request.status !== 'pending') {
      return sendError(res, 400, `Request is already ${request.status}.`);
    }

    // Update ExpertRequest
    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    // Update User status to active
    const updatedUser = await User.findByIdAndUpdate(
      request.user._id,
      { status: 'active' },
      { new: true }
    );

    // In-app notification
    await createNotification({
      recipient: request.user._id,
      type: 'expert_approved',
      title: 'Expert Application Approved',
      message: 'Congratulations! Your expert application has been approved. You can now login to Avelia.',
      link: '/login',
    });

    // Email notification — non-blocking so a mail failure doesn't break the approval
    sendExpertApprovedEmail(
      request.user.email,
      request.user.name,
      updatedUser.loginId || request.user.loginId
    ).catch((e) => console.error('Approval email error:', e.message));

    return sendSuccess(res, 200, 'Expert approved successfully.', {
      requestId: request._id,
      status: 'approved',
    });
  } catch (err) {
    console.error('approveExpert error:', err);
    return sendError(res, 500, 'Failed to approve expert.');
  }
};

// PATCH /api/admin/experts/requests/:id/reject
// Body: { reason }
const rejectExpert = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 10) {
      return sendError(res, 400, 'A rejection reason of at least 10 characters is required.');
    }

    const request = await ExpertRequest.findById(req.params.id).populate('user');
    if (!request) return sendError(res, 404, 'Expert request not found.');
    if (request.status !== 'pending') {
      return sendError(res, 400, `Request is already ${request.status}.`);
    }

    // Update ExpertRequest
    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.rejectionReason = reason.trim();
    await request.save();

    // Update User
    await User.findByIdAndUpdate(request.user._id, {
      status: 'rejected',
      rejectionReason: reason.trim(),
    });

    // In-app notification
    await createNotification({
      recipient: request.user._id,
      type: 'expert_rejected',
      title: 'Expert Application Rejected',
      message: `Your expert application was not approved. Reason: ${reason.trim()}`,
    });

    // Email notification — non-blocking
    sendExpertRejectedEmail(
      request.user.email,
      request.user.name,
      reason.trim()
    ).catch((e) => console.error('Rejection email error:', e.message));

    return sendSuccess(res, 200, 'Expert rejected.', {
      requestId: request._id,
      status: 'rejected',
    });
  } catch (err) {
    console.error('rejectExpert error:', err);
    return sendError(res, 500, 'Failed to reject expert.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/products?status=active&search=wheat&category=Grains&page=1&limit=20
const getProducts = async (req, res) => {
  try {
    const { status, search, category, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmer', 'name email loginId')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Products fetched.', {
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getProducts error:', err);
    return sendError(res, 500, 'Failed to fetch products.');
  }
};

// GET /api/admin/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name email mobile loginId')
      .populate('hiddenBy', 'name')
      .select('-__v')
      .lean();
    if (!product) return sendError(res, 404, 'Product not found.');
    return sendSuccess(res, 200, 'Product fetched.', { product });
  } catch (err) {
    console.error('getProductById error:', err);
    return sendError(res, 500, 'Failed to fetch product.');
  }
};

// PATCH /api/admin/products/:id/hide
// Body: { reason }
const hideProduct = async (req, res) => {
  try {
    const { reason } = req.body;
    const product = await Product.findById(req.params.id).populate('farmer', 'name');
    if (!product) return sendError(res, 404, 'Product not found.');
    if (product.status === 'hidden') return sendError(res, 400, 'Product is already hidden.');

    product.status = 'hidden';
    product.hiddenReason = reason || 'Removed by admin.';
    product.hiddenBy = req.user.id;
    await product.save();

    await createNotification({
      recipient: product.farmer._id,
      type: 'product_hidden',
      title: 'Product Listing Removed',
      message: `Your product "${product.name}" has been removed. Reason: ${product.hiddenReason}`,
    });

    return sendSuccess(res, 200, 'Product hidden successfully.');
  } catch (err) {
    console.error('hideProduct error:', err);
    return sendError(res, 500, 'Failed to hide product.');
  }
};

// PATCH /api/admin/products/:id/restore
const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 404, 'Product not found.');
    if (product.status !== 'hidden') return sendError(res, 400, 'Product is not hidden.');

    product.status = 'active';
    product.hiddenReason = null;
    product.hiddenBy = null;
    await product.save();

    return sendSuccess(res, 200, 'Product restored successfully.');
  } catch (err) {
    console.error('restoreProduct error:', err);
    return sendError(res, 500, 'Failed to restore product.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER MONITORING
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/orders?status=pending&page=1&limit=20
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('buyer', 'name email loginId')
        .populate('farmer', 'name email loginId')
        .select('-__v -statusHistory')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Orders fetched.', {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getOrders error:', err);
    return sendError(res, 500, 'Failed to fetch orders.');
  }
};

// GET /api/admin/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email mobile loginId')
      .populate('farmer', 'name email mobile loginId')
      .populate('items.product', 'name images')
      .select('-__v')
      .lean();
    if (!order) return sendError(res, 404, 'Order not found.');
    return sendSuccess(res, 200, 'Order fetched.', { order });
  } catch (err) {
    console.error('getOrderById error:', err);
    return sendError(res, 500, 'Failed to fetch order.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS & COMPLAINTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/reports?status=pending&page=1&limit=20
const getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reportedBy', 'name email role loginId')
        .populate('reviewedBy', 'name')
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Reports fetched.', {
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getReports error:', err);
    return sendError(res, 500, 'Failed to fetch reports.');
  }
};

// GET /api/admin/reports/:id
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'name email role loginId mobile')
      .populate('reviewedBy', 'name email')
      .select('-__v')
      .lean();
    if (!report) return sendError(res, 404, 'Report not found.');
    return sendSuccess(res, 200, 'Report fetched.', { report });
  } catch (err) {
    console.error('getReportById error:', err);
    return sendError(res, 500, 'Failed to fetch report.');
  }
};

// PATCH /api/admin/reports/:id/status
// Body: { status, resolutionNote }
const updateReportStatus = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;
    const allowed = ['under_review', 'resolved', 'rejected'];
    if (!status || !allowed.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${allowed.join(', ')}.`);
    }

    const report = await Report.findById(req.params.id);
    if (!report) return sendError(res, 404, 'Report not found.');

    report.status = status;
    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();
    if (resolutionNote) report.resolutionNote = resolutionNote.trim();
    await report.save();

    return sendSuccess(res, 200, 'Report status updated.', {
      reportId: report._id,
      status: report.status,
    });
  } catch (err) {
    console.error('updateReportStatus error:', err);
    return sendError(res, 500, 'Failed to update report status.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/notifications?page=1&limit=30
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const adminId = req.user.id;

    // Include this admin's personal notifications and legacy platform broadcasts.
    const filter = { $or: [{ recipient: adminId }, { recipient: null }] };

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v')
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({
        $or: [
          { recipient: adminId, isRead: false },
          { recipient: null, isRead: false, readBy: { $ne: adminId } },
        ],
      }),
    ]);

    return sendSuccess(res, 200, 'Notifications fetched.', {
      notifications: notifications.map((notification) => ({
        ...notification,
        isRead: notification.recipient
          ? notification.isRead
          : notification.isRead || notification.readBy?.some((id) => String(id) === String(adminId)),
      })),
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return sendError(res, 500, 'Failed to fetch notifications.');
  }
};

// PATCH /api/admin/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      $or: [{ recipient: req.user.id }, { recipient: null }],
    });
    if (!notification) return sendError(res, 404, 'Notification not found.');

    if (notification.recipient === null) {
      await Notification.updateOne(
        { _id: notification._id },
        { $addToSet: { readBy: req.user.id } }
      );
    } else {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return sendSuccess(res, 200, 'Notification marked as read.');
  } catch (err) {
    console.error('markNotificationRead error:', err);
    return sendError(res, 500, 'Failed to mark notification as read.');
  }
};

// PATCH /api/admin/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    await Promise.all([
      Notification.updateMany(
        { recipient: req.user.id, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      ),
      Notification.updateMany(
        { recipient: null, isRead: false, readBy: { $ne: req.user.id } },
        { $addToSet: { readBy: req.user.id } }
      ),
    ]);
    return sendSuccess(res, 200, 'All notifications marked as read.');
  } catch (err) {
    console.error('markAllNotificationsRead error:', err);
    return sendError(res, 500, 'Failed to mark notifications as read.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PROFILE
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-__v -password').lean();
    if (!admin) return sendError(res, 404, 'Admin not found.');
    return sendSuccess(res, 200, 'Profile fetched.', { admin });
  } catch (err) {
    console.error('getAdminProfile error:', err);
    return sendError(res, 500, 'Failed to fetch profile.');
  }
};

// PATCH /api/admin/profile
// Body: { name, mobile }
const updateAdminProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (mobile && mobile.trim()) updates.mobile = mobile.trim();

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'No valid fields to update.');
    }

    const admin = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-__v -password');

    return sendSuccess(res, 200, 'Profile updated.', { admin });
  } catch (err) {
    console.error('updateAdminProfile error:', err);
    return sendError(res, 500, 'Failed to update profile.');
  }
};

// PATCH /api/admin/profile/change-password
// Body: { currentPassword, newPassword }
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current and new password are required.');
    }
    if (newPassword.length < 8) {
      return sendError(res, 400, 'New password must be at least 8 characters.');
    }

    const { comparePassword, hashPassword } = require('../utils/hashPassword');
    const admin = await User.findById(req.user.id).select('+password');
    if (!admin) return sendError(res, 404, 'Admin not found.');

    const isMatch = await comparePassword(currentPassword, admin.password);
    if (!isMatch) return sendError(res, 401, 'Current password is incorrect.');

    admin.password = await hashPassword(newPassword);
    await admin.save();

    return sendSuccess(res, 200, 'Password changed successfully.');
  } catch (err) {
    console.error('changeAdminPassword error:', err);
    return sendError(res, 500, 'Failed to change password.');
  }
};

// GET /api/admin/advisories?type=consultations|disease-cases|crop-advice
const getAdvisories = async (req, res) => {
  try {
    const { type = 'consultations', status, search, page = '1', limit = '15' } = req.query;
    const types = ['consultations', 'disease-cases', 'crop-advice'];
    if (!types.includes(type)) {
      return sendError(res, 400, `Type must be one of: ${types.join(', ')}.`);
    }

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    if (!Number.isInteger(pageNumber) || pageNumber < 1 ||
        !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      return sendError(res, 400, 'Page must be positive and limit must be between 1 and 100.');
    }
    if (search !== undefined && (typeof search !== 'string' || search.length > 100)) {
      return sendError(res, 400, 'Search must be 100 characters or fewer.');
    }

    const filters = {
      consultations: {
        model: Consultation,
        statuses: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        populate: [
          ['farmer', 'name email loginId'],
          ['expert', 'name email loginId'],
        ],
        searchableFields: ['cropName', 'problemTitle', 'description', 'symptoms'],
      },
      'disease-cases': {
        model: DiseaseCase,
        statuses: ['pending', 'under_review', 'diagnosed', 'closed'],
        populate: [
          ['farmer', 'name email loginId'],
          ['expert', 'name email loginId'],
        ],
        searchableFields: ['cropName', 'symptoms', 'description'],
      },
      'crop-advice': {
        model: CropAdvice,
        statuses: ['draft', 'published'],
        populate: [
          ['farmer', 'name email loginId'],
          ['expert', 'name email loginId'],
          ['consultation', 'cropName problemTitle status'],
          ['diseaseCase', 'cropName status'],
        ],
        searchableFields: ['cropName', 'observedProblem', 'recommendedActions', 'additionalNotes'],
      },
    };
    const config = filters[type];
    if (status && !config.statuses.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${config.statuses.join(', ')}.`);
    }

    const filter = {};
    if (status) filter.status = status;
    if (search?.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      filter.$or = config.searchableFields.map((field) => ({ [field]: regex }));
    }

    let query = config.model.find(filter).select('-__v').sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize).limit(pageSize);
    for (const [path, selection] of config.populate) {
      query = query.populate(path, selection);
    }

    const [records, total] = await Promise.all([
      query.lean(),
      config.model.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Advisory records fetched.', {
      type,
      records,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error('getAdvisories error:', err);
    return sendError(res, 500, 'Failed to fetch advisory records.');
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getUsers,
  getUserById,
  updateUserStatus,
  getExpertRequests,
  getExpertRequestById,
  approveExpert,
  rejectExpert,
  getProducts,
  getProductById,
  hideProduct,
  restoreProduct,
  getOrders,
  getOrderById,
  getReports,
  getReportById,
  updateReportStatus,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdvisories,
};
