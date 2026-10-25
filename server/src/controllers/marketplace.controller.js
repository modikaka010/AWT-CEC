const Product = require('../models/Product');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const PRODUCT_CATEGORIES = [
  'Grains & Cereals', 'Vegetables', 'Fruits', 'Pulses & Legumes',
  'Oilseeds', 'Spices & Herbs', 'Dairy & Livestock', 'Flowers', 'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyer/marketplace
// Query: search, category, minPrice, maxPrice, state, sort, page, limit
// Public to buyers — only shows active products
// ─────────────────────────────────────────────────────────────────────────────
const getMarketplaceProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      state, sort = 'newest', page = 1, limit = 16,
    } = req.query;

    const filter = { status: 'active' };

    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ name: re }, { description: re }, { category: re }];
    }
    if (category && PRODUCT_CATEGORIES.includes(category)) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (state) filter['location.state'] = new RegExp(state, 'i');

    const sortMap = {
      newest:      { createdAt: -1 },
      oldest:      { createdAt: 1 },
      price_asc:   { price: 1 },
      price_desc:  { price: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmer', 'name loginId')
        .select('-hiddenReason -hiddenBy -__v')
        .sort(sortObj)
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
      categories: PRODUCT_CATEGORIES,
    });
  } catch (err) {
    console.error('getMarketplaceProducts error:', err);
    return sendError(res, 500, 'Failed to fetch products.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyer/marketplace/:id
// ─────────────────────────────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, status: 'active' })
      .populate('farmer', 'name email mobile loginId createdAt')
      .select('-hiddenReason -hiddenBy -__v')
      .lean();

    if (!product) return sendError(res, 404, 'Product not found or no longer available.');

    return sendSuccess(res, 200, 'Product fetched.', { product });
  } catch (err) {
    console.error('getProductById error:', err);
    return sendError(res, 500, 'Failed to fetch product.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyer/marketplace/farmers
// Browse farmers who have active listings
// ─────────────────────────────────────────────────────────────────────────────
const getMarketplaceFarmers = async (req, res) => {
  try {
    const { search, state, page = 1, limit = 12 } = req.query;

    // Farmers with at least one active product
    const activeFarmerIds = await Product.distinct('farmer', { status: 'active' });

    const filter = { _id: { $in: activeFarmerIds }, role: 'farmer', status: 'active' };
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ name: re }, { email: re }, { loginId: re }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [farmers, total] = await Promise.all([
      User.find(filter)
        .select('name email loginId createdAt')
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach active product count per farmer
    const farmerIds = farmers.map((f) => f._id);
    const counts = await Product.aggregate([
      { $match: { farmer: { $in: farmerIds }, status: 'active' } },
      { $group: { _id: '$farmer', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

    const enriched = farmers.map((f) => ({
      ...f,
      activeProductCount: countMap[String(f._id)] || 0,
    }));

    return sendSuccess(res, 200, 'Farmers fetched.', {
      farmers: enriched,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('getMarketplaceFarmers error:', err);
    return sendError(res, 500, 'Failed to fetch farmers.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyer/marketplace/farmers/:id
// ─────────────────────────────────────────────────────────────────────────────
const getFarmerById = async (req, res) => {
  try {
    const farmer = await User.findOne({
      _id: req.params.id, role: 'farmer', status: 'active',
    }).select('name email loginId createdAt').lean();

    if (!farmer) return sendError(res, 404, 'Farmer not found.');

    const products = await Product.find({ farmer: farmer._id, status: 'active' })
      .select('-hiddenReason -hiddenBy -__v')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Farmer details fetched.', { farmer, products });
  } catch (err) {
    console.error('getFarmerById error:', err);
    return sendError(res, 500, 'Failed to fetch farmer details.');
  }
};

module.exports = { getMarketplaceProducts, getProductById, getMarketplaceFarmers, getFarmerById };
