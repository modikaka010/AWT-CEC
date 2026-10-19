const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const PRODUCT_CATEGORIES = [
  'Grains & Cereals', 'Vegetables', 'Fruits', 'Pulses & Legumes',
  'Oilseeds', 'Spices & Herbs', 'Dairy & Livestock', 'Flowers', 'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/products?search=&category=&status=&sort=newest&page=1&limit=15
// ─────────────────────────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { search, category, status, sort = 'newest', page = 1, limit = 15 } = req.query;

    const filter = { farmer: req.user.id };
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ name: re }, { description: re }, { category: re }];
    }
    if (category && PRODUCT_CATEGORIES.includes(category)) filter.category = category;
    if (status && ['active', 'sold', 'hidden', 'draft'].includes(status)) filter.status = status;

    const sortMap = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt: 1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      qty_asc:    { quantity: 1 },
      qty_desc:   { quantity: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('-hiddenReason -hiddenBy -__v')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Products fetched.', {
      products,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      categories: PRODUCT_CATEGORIES,
    });
  } catch (err) {
    console.error('getProducts error:', err);
    return sendError(res, 500, 'Failed to fetch products.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/products/:id
// ─────────────────────────────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user.id })
      .select('-__v')
      .lean();
    if (!product) return sendError(res, 404, 'Product not found.');

    // Basic product stats
    const [totalOrders, revenue] = await Promise.all([
      Order.countDocuments({ 'items.product': product._id, farmer: req.user.id }),
      Order.aggregate([
        { $match: { farmer: new (require('mongoose').Types.ObjectId)(req.user.id), status: 'delivered' } },
        { $unwind: '$items' },
        { $match: { 'items.product': product._id } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$items.quantity', '$items.priceAtOrder'] } } } },
      ]),
    ]);

    return sendSuccess(res, 200, 'Product fetched.', {
      product,
      stats: {
        totalOrders,
        revenue: revenue?.[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error('getProductById error:', err);
    return sendError(res, 500, 'Failed to fetch product.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/farmer/products
// Body: { name, category, description, price, priceUnit, quantity, quantityUnit,
//         images, status, location }
// ─────────────────────────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const {
      name, category, description, price, priceUnit,
      quantity, quantityUnit, images, status, location,
    } = req.body;

    if (!name?.trim()) return sendError(res, 400, 'Product name is required.');
    if (!category || !PRODUCT_CATEGORIES.includes(category))
      return sendError(res, 400, 'Valid category is required.');
    if (price == null || parseFloat(price) < 0)
      return sendError(res, 400, 'Valid price is required.');
    if (quantity == null || parseInt(quantity) < 0)
      return sendError(res, 400, 'Valid quantity is required.');

    const product = await Product.create({
      farmer: req.user.id,
      name: name.trim(),
      category,
      description: description?.trim() || '',
      price: parseFloat(price),
      priceUnit: priceUnit?.trim() || 'per kg',
      quantity: parseInt(quantity),
      quantityUnit: quantityUnit?.trim() || 'kg',
      images: Array.isArray(images) ? images.filter(Boolean) : [],
      status: status || 'active',
      location: location || {},
    });

    return sendSuccess(res, 201, 'Product listed successfully.', { product });
  } catch (err) {
    console.error('createProduct error:', err);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ');
      return sendError(res, 400, msg);
    }
    return sendError(res, 500, 'Failed to create product.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/farmer/products/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!product) return sendError(res, 404, 'Product not found.');

    // Admin-hidden products cannot be edited by farmer
    if (product.status === 'hidden')
      return sendError(res, 403, 'This product has been hidden by admin. Contact support to resolve.');

    const allowedFields = ['name', 'category', 'description', 'price', 'priceUnit', 'quantity', 'quantityUnit', 'images', 'status', 'location'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'category' && !PRODUCT_CATEGORIES.includes(req.body[field]))
          return sendError(res, 400, 'Invalid category.');
        if (field === 'status' && !['active', 'draft'].includes(req.body[field]))
          return sendError(res, 400, 'Farmer can only set status to active or draft.');
        product[field] = req.body[field];
      }
    }

    // Re-activate if previously sold and new quantity is added
    if (product.status === 'sold' && req.body.quantity > 0) product.status = 'active';

    await product.save();
    return sendSuccess(res, 200, 'Product updated.', { product });
  } catch (err) {
    console.error('updateProduct error:', err);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ');
      return sendError(res, 400, msg);
    }
    return sendError(res, 500, 'Failed to update product.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/farmer/products/:id
// Soft delete — sets status to 'draft' (so orders still work)
// ─────────────────────────────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!product) return sendError(res, 404, 'Product not found.');

    // Check for active/pending orders first
    const activeOrderCount = await Order.countDocuments({
      'items.product': product._id,
      farmer: req.user.id,
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] },
    });
    if (activeOrderCount > 0)
      return sendError(res, 409, `Cannot delete — this product has ${activeOrderCount} active order(s). Archive it instead.`);

    product.status = 'draft';
    await product.save();

    return sendSuccess(res, 200, 'Product archived successfully.');
  } catch (err) {
    console.error('deleteProduct error:', err);
    return sendError(res, 500, 'Failed to delete product.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/farmer/products/categories — return allowed categories
// ─────────────────────────────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  return sendSuccess(res, 200, 'Categories fetched.', { categories: PRODUCT_CATEGORIES });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories };
