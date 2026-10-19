const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const notify = async (opts) => {
  try { await Notification.create(opts); } catch (e) { console.error('notify error:', e.message); }
};

// Valid status transitions (farmer perspective)
const VALID_TRANSITIONS = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/orders?status=pending&page=1&limit=15&search=
// ─────────────────────────────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 15, search } = req.query;
    const filter = { farmer: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = Order.find(filter)
      .populate('buyer', 'name loginId mobile email')
      .select('-statusHistory -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const [orders, total] = await Promise.all([
      query.lean(),
      Order.countDocuments(filter),
    ]);

    // Client-side search by buyer name (simple approach)
    const filtered = search
      ? orders.filter((o) => o.buyer?.name?.toLowerCase().includes(search.toLowerCase()))
      : orders;

    return sendSuccess(res, 200, 'Orders fetched.', {
      orders: filtered,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('farmer getOrders error:', err);
    return sendError(res, 500, 'Failed to fetch orders.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/orders/:id
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user.id })
      .populate('buyer', 'name loginId mobile email')
      .populate('items.product', 'name images')
      .lean();

    if (!order) return sendError(res, 404, 'Order not found.');
    return sendSuccess(res, 200, 'Order fetched.', { order });
  } catch (err) {
    console.error('farmer getOrderById error:', err);
    return sendError(res, 500, 'Failed to fetch order.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/farmer/orders/:id/status
// Body: { status, note }
// ─────────────────────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) return sendError(res, 400, 'Status is required.');

    const order = await Order.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!order) return sendError(res, 404, 'Order not found.');

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status))
      return sendError(res, 400, `Cannot transition from "${order.status}" to "${status}".`);

    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.id,
      note: note?.trim() || `Status updated to ${status} by farmer.`,
    });

    // If cancelling — restore product quantities
    if (status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
          $set: { status: 'active' },
        });
      }
    }

    await order.save();

    // Notify buyer
    const notifMap = {
      confirmed:  { type: 'order_confirmed',  title: 'Order Confirmed',  msg: 'Your order has been confirmed by the farmer.' },
      processing: { type: 'order_status',     title: 'Order Processing', msg: 'Your order is being prepared by the farmer.' },
      shipped:    { type: 'order_shipped',    title: 'Order Shipped',    msg: 'Your order has been shipped and is on its way.' },
      delivered:  { type: 'order_delivered',  title: 'Order Delivered',  msg: 'Your order has been delivered!' },
      cancelled:  { type: 'order_cancelled',  title: 'Order Cancelled',  msg: `Your order has been cancelled by the farmer.${note ? ' Reason: ' + note : ''}` },
    };
    if (notifMap[status]) {
      const n = notifMap[status];
      await notify({
        recipient: order.buyer,
        type: n.type,
        title: n.title,
        message: n.msg,
        link: `/buyer/orders/${order._id}`,
      });
    }

    return sendSuccess(res, 200, `Order status updated to "${status}".`, { order: { _id: order._id, status: order.status } });
  } catch (err) {
    console.error('farmer updateOrderStatus error:', err);
    return sendError(res, 500, 'Failed to update order status.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/orders/:id/tracking
// ─────────────────────────────────────────────────────────────────────────────
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user.id })
      .populate('buyer', 'name loginId')
      .select('buyer status statusHistory deliveryAddress totalAmount createdAt items')
      .lean();

    if (!order) return sendError(res, 404, 'Order not found.');

    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const isCancelled = order.status === 'cancelled';
    const currentStep = isCancelled ? -1 : steps.indexOf(order.status);

    return sendSuccess(res, 200, 'Order tracking fetched.', {
      order,
      steps,
      currentStep,
      isCancelled,
    });
  } catch (err) {
    console.error('farmer getOrderTracking error:', err);
    return sendError(res, 500, 'Failed to fetch order tracking.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/analytics
// ─────────────────────────────────────────────────────────────────────────────
const getSalesAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const mongoose = require('mongoose');
    const farmerObjId = new mongoose.Types.ObjectId(farmerId);

    const [
      totalRevenue,
      monthlyRevenue,
      topProducts,
      ordersByStatus,
      recentDelivered,
    ] = await Promise.all([
      // Total revenue from delivered orders
      Order.aggregate([
        { $match: { farmer: farmerObjId, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),

      // Monthly revenue — last 6 months
      Order.aggregate([
        { $match: { farmer: farmerObjId, status: 'delivered' } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]),

      // Top selling products (by quantity in delivered orders)
      Order.aggregate([
        { $match: { farmer: farmerObjId, status: 'delivered' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            productName: { $first: '$items.productName' },
            totalQty: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.priceAtOrder'] } },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
      ]),

      // Orders by status
      Order.aggregate([
        { $match: { farmer: farmerObjId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Recent delivered orders
      Order.find({ farmer: farmerObjId, status: 'delivered' })
        .populate('buyer', 'name')
        .select('buyer totalAmount createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalRev = totalRevenue?.[0]?.total || 0;
    const totalDelivered = totalRevenue?.[0]?.count || 0;
    const avgOrderValue = totalDelivered > 0 ? Math.round(totalRev / totalDelivered) : 0;

    // Normalise ordersByStatus into a map
    const statusCounts = {};
    ordersByStatus.forEach((s) => { statusCounts[s._id] = s.count; });

    return sendSuccess(res, 200, 'Analytics fetched.', {
      totalRevenue: totalRev,
      totalDeliveredOrders: totalDelivered,
      avgOrderValue,
      monthlyRevenue: monthlyRevenue.reverse(), // chronological
      topProducts,
      ordersByStatus: statusCounts,
      recentDelivered,
    });
  } catch (err) {
    console.error('farmer getSalesAnalytics error:', err);
    return sendError(res, 500, 'Failed to fetch analytics.');
  }
};

module.exports = {
  getOrders, getOrderById, updateOrderStatus,
  getOrderTracking, getSalesAnalytics,
};
