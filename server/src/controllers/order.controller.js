const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { notifyAdmins } = require('../services/notification.service');

const notify = async (opts) => {
  try { await Notification.create(opts); } catch (e) { console.error('notify error:', e.message); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/buyer/orders
// Body: { items: [{productId, quantity}], deliveryAddress, paymentMethod, notes }
// Groups by farmer, creates one Order per farmer, deducts quantity
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod = 'cod', notes, fromCart = false } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return sendError(res, 400, 'At least one item is required.');
    if (!deliveryAddress?.line1 || !deliveryAddress?.city || !deliveryAddress?.state)
      return sendError(res, 400, 'Delivery address (line1, city, state) is required.');

    // ── Validate all products first ──────────────────────────────────────────
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, status: 'active' }).lean();
    const productMap = Object.fromEntries(products.map((p) => [String(p._id), p]));

    for (const item of items) {
      const p = productMap[String(item.productId)];
      if (!p) return sendError(res, 400, `Product "${item.productId}" is not available.`);
      if (p.quantity < item.quantity)
        return sendError(res, 400, `Only ${p.quantity} ${p.quantityUnit} of "${p.name}" available.`);
    }

    // ── Group items by farmer ────────────────────────────────────────────────
    const byFarmer = {};
    for (const item of items) {
      const p = productMap[String(item.productId)];
      const farmerId = String(p.farmer);
      if (!byFarmer[farmerId]) byFarmer[farmerId] = [];
      byFarmer[farmerId].push({ product: p, quantity: item.quantity });
    }

    const createdOrders = [];

    for (const [farmerId, farmerItems] of Object.entries(byFarmer)) {
      const orderItems = farmerItems.map(({ product, quantity }) => ({
        product: product._id,
        productName: product.name,
        quantity,
        priceAtOrder: product.price,
        priceUnit: product.priceUnit,
      }));

      const totalAmount = orderItems.reduce(
        (sum, i) => sum + i.quantity * i.priceAtOrder, 0
      );

      const order = await Order.create({
        buyer: req.user.id,
        farmer: farmerId,
        items: orderItems,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        notes: notes || null,
        statusHistory: [{ status: 'pending', changedAt: new Date(), note: 'Order placed by buyer.' }],
      });

      // Deduct product quantities
      for (const { product, quantity } of farmerItems) {
        const newQty = product.quantity - quantity;
        await Product.findByIdAndUpdate(product._id, {
          quantity: newQty,
          ...(newQty === 0 ? { status: 'sold' } : {}),
        });
      }

      // Notify farmer
      await notify({
        recipient: farmerId,
        type: 'new_order',
        title: 'New Order Received',
        message: `You have a new order from a buyer. Order total: ₹${totalAmount.toLocaleString('en-IN')}.`,
        link: `/farmer/orders/${order._id}`,
      });

      // Notify buyer
      await notify({
        recipient: req.user.id,
        type: 'order_placed',
        title: 'Order Placed Successfully',
        message: `Your order has been placed. Order ID: ${String(order._id).slice(-8).toUpperCase()}.`,
        link: `/buyer/orders/${order._id}`,
      });

      await notifyAdmins({
        type: 'new_order',
        title: 'New Marketplace Order',
        message: `A new order was placed for ₹${totalAmount.toLocaleString('en-IN')}.`,
        link: '/admin/orders',
      });

      createdOrders.push(order);
    }

    // Clear cart if order came from cart
    if (fromCart) {
      await Cart.findOneAndUpdate({ buyer: req.user.id }, { $set: { items: [] } });
    }

    return sendSuccess(res, 201, `${createdOrders.length} order(s) placed successfully.`, {
      orders: createdOrders.map((o) => ({ _id: o._id, totalAmount: o.totalAmount, status: o.status })),
    });
  } catch (err) {
    console.error('createOrder error:', err);
    return sendError(res, 500, 'Failed to place order.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyer/orders?status=pending&page=1&limit=15
// ─────────────────────────────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const filter = { buyer: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('farmer', 'name loginId')
        .select('-statusHistory -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Orders fetched.', {
      orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('getOrders error:', err);
    return sendError(res, 500, 'Failed to fetch orders.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyer/orders/:id
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user.id })
      .populate('farmer', 'name email mobile loginId')
      .populate('items.product', 'name images')
      .lean();
    if (!order) return sendError(res, 404, 'Order not found.');
    return sendSuccess(res, 200, 'Order fetched.', { order });
  } catch (err) {
    console.error('getOrderById error:', err);
    return sendError(res, 500, 'Failed to fetch order.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/buyer/orders/:id/cancel
// Body: { reason }
// ─────────────────────────────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user.id });
    if (!order) return sendError(res, 404, 'Order not found.');

    const cancellable = ['pending', 'confirmed'];
    if (!cancellable.includes(order.status))
      return sendError(res, 400, `Cannot cancel an order with status "${order.status}".`);

    const reason = req.body.reason?.trim() || 'Cancelled by buyer.';
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', changedAt: new Date(), note: reason });
    await order.save();

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity },
        status: 'active',
      });
    }

    await notify({
      recipient: order.farmer,
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: `A buyer has cancelled their order. Reason: ${reason}`,
      link: `/farmer/orders/${order._id}`,
    });

    return sendSuccess(res, 200, 'Order cancelled successfully.', { orderId: order._id, status: order.status });
  } catch (err) {
    console.error('cancelOrder error:', err);
    return sendError(res, 500, 'Failed to cancel order.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyer/orders/:id/tracking
// ─────────────────────────────────────────────────────────────────────────────
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user.id })
      .select('status statusHistory createdAt updatedAt farmer items totalAmount')
      .populate('farmer', 'name loginId')
      .lean();
    if (!order) return sendError(res, 404, 'Order not found.');

    const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentStep = STEPS.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    return sendSuccess(res, 200, 'Tracking fetched.', {
      order,
      steps: STEPS,
      currentStep: isCancelled ? -1 : currentStep,
      isCancelled,
    });
  } catch (err) {
    console.error('getOrderTracking error:', err);
    return sendError(res, 500, 'Failed to fetch tracking.');
  }
};

module.exports = { createOrder, getOrders, getOrderById, cancelOrder, getOrderTracking };
