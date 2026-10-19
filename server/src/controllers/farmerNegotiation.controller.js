const Negotiation = require('../models/Negotiation');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const notify = async (opts) => {
  try { await Notification.create(opts); } catch (e) { console.error('notify error:', e.message); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/negotiations?status=pending&page=1&limit=15
// ─────────────────────────────────────────────────────────────────────────────
const getNegotiations = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const filter = { farmer: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [negotiations, total] = await Promise.all([
      Negotiation.find(filter)
        .populate('buyer', 'name loginId email')
        .populate('product', 'name images price priceUnit')
        .select('-offers -__v')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Negotiation.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Negotiations fetched.', {
      negotiations,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('farmer getNegotiations error:', err);
    return sendError(res, 500, 'Failed to fetch negotiations.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/negotiations/:id
// ─────────────────────────────────────────────────────────────────────────────
const getNegotiationById = async (req, res) => {
  try {
    const negotiation = await Negotiation.findOne({ _id: req.params.id, farmer: req.user.id })
      .populate('buyer', 'name email loginId mobile')
      .populate('product', 'name images price priceUnit quantity quantityUnit status')
      .lean();
    if (!negotiation) return sendError(res, 404, 'Negotiation not found.');
    return sendSuccess(res, 200, 'Negotiation fetched.', { negotiation });
  } catch (err) {
    console.error('farmer getNegotiationById error:', err);
    return sendError(res, 500, 'Failed to fetch negotiation.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/farmer/negotiations/:id/counter
// Body: { offerPrice, quantity, message }
// Farmer sends a counter offer to buyer
// ─────────────────────────────────────────────────────────────────────────────
const sendCounterOffer = async (req, res) => {
  try {
    const { offerPrice, quantity, message } = req.body;
    if (!offerPrice || !quantity) return sendError(res, 400, 'Offer price and quantity are required.');

    const price = parseFloat(offerPrice);
    const qty = parseInt(quantity);
    if (price <= 0 || qty < 1) return sendError(res, 400, 'Invalid price or quantity.');

    const negotiation = await Negotiation.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!negotiation) return sendError(res, 404, 'Negotiation not found.');
    if (!['pending', 'countered'].includes(negotiation.status))
      return sendError(res, 400, `Cannot counter a negotiation with status "${negotiation.status}".`);

    negotiation.offers.push({ by: 'farmer', price, quantity: qty, message: message?.trim() || null });
    negotiation.currentPrice = price;
    negotiation.currentQuantity = qty;
    negotiation.status = 'countered';
    await negotiation.save();

    await notify({
      recipient: negotiation.buyer,
      type: 'negotiation_countered',
      title: 'Farmer Sent Counter Offer',
      message: `The farmer has countered with ₹${price} for "${negotiation.productName}" (${qty} units).`,
      link: `/buyer/negotiations/${negotiation._id}`,
    });

    return sendSuccess(res, 200, 'Counter offer sent.', { negotiation });
  } catch (err) {
    console.error('farmer sendCounterOffer error:', err);
    return sendError(res, 500, 'Failed to send counter offer.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/farmer/negotiations/:id/accept
// Farmer accepts buyer's offer
// ─────────────────────────────────────────────────────────────────────────────
const acceptNegotiation = async (req, res) => {
  try {
    const negotiation = await Negotiation.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!negotiation) return sendError(res, 404, 'Negotiation not found.');
    if (!['pending', 'countered'].includes(negotiation.status))
      return sendError(res, 400, `Cannot accept a negotiation with status "${negotiation.status}".`);

    negotiation.status = 'accepted';
    negotiation.agreedPrice = negotiation.currentPrice;
    negotiation.agreedQuantity = negotiation.currentQuantity;
    await negotiation.save();

    await notify({
      recipient: negotiation.buyer,
      type: 'negotiation_accepted',
      title: 'Negotiation Accepted!',
      message: `Your offer of ₹${negotiation.agreedPrice} for "${negotiation.productName}" has been accepted by the farmer.`,
      link: `/buyer/negotiations/${negotiation._id}`,
    });

    return sendSuccess(res, 200, 'Negotiation accepted.', { negotiation });
  } catch (err) {
    console.error('farmer acceptNegotiation error:', err);
    return sendError(res, 500, 'Failed to accept negotiation.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/farmer/negotiations/:id/reject
// Body: { reason }
// ─────────────────────────────────────────────────────────────────────────────
const rejectNegotiation = async (req, res) => {
  try {
    const negotiation = await Negotiation.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!negotiation) return sendError(res, 404, 'Negotiation not found.');
    if (!['pending', 'countered'].includes(negotiation.status))
      return sendError(res, 400, `Cannot reject a negotiation with status "${negotiation.status}".`);

    negotiation.status = 'rejected';
    negotiation.rejectionReason = req.body.reason?.trim() || null;
    await negotiation.save();

    await notify({
      recipient: negotiation.buyer,
      type: 'negotiation_rejected',
      title: 'Negotiation Rejected',
      message: `Your negotiation for "${negotiation.productName}" has been rejected by the farmer.`,
      link: `/buyer/negotiations/${negotiation._id}`,
    });

    return sendSuccess(res, 200, 'Negotiation rejected.', { negotiation });
  } catch (err) {
    console.error('farmer rejectNegotiation error:', err);
    return sendError(res, 500, 'Failed to reject negotiation.');
  }
};

module.exports = {
  getNegotiations, getNegotiationById,
  sendCounterOffer, acceptNegotiation, rejectNegotiation,
};
