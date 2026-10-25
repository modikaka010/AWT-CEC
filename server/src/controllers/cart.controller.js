const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/buyer/cart
// ─────────────────────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyer: req.user.id })
      .populate('items.product', 'name price priceUnit quantity quantityUnit status images')
      .populate('items.farmer', 'name loginId')
      .lean();

    if (!cart) cart = { buyer: req.user.id, items: [] };

    // Calculate totals and flag unavailable items
    let grandTotal = 0;
    const enrichedItems = cart.items.map((item) => {
      const prod = item.product;
      const available = prod && prod.status === 'active' && prod.quantity >= item.quantity;
      const subtotal = item.quantity * item.priceAtAdd;
      grandTotal += subtotal;
      return { ...item, subtotal, available, currentPrice: prod?.price };
    });

    return sendSuccess(res, 200, 'Cart fetched.', {
      items: enrichedItems,
      grandTotal,
      itemCount: cart.items.length,
    });
  } catch (err) {
    console.error('getCart error:', err);
    return sendError(res, 500, 'Failed to fetch cart.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/buyer/cart
// Body: { productId, quantity }
// ─────────────────────────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1)
      return sendError(res, 400, 'Product ID and valid quantity are required.');

    const qty = parseInt(quantity);
    const product = await Product.findOne({ _id: productId, status: 'active' })
      .populate('farmer', 'name loginId').lean();

    if (!product) return sendError(res, 404, 'Product not found or not available.');
    if (product.quantity < qty)
      return sendError(res, 400, `Only ${product.quantity} ${product.quantityUnit} available.`);

    let cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) cart = new Cart({ buyer: req.user.id, items: [] });

    const existing = cart.items.find((i) => String(i.product) === String(productId));
    if (existing) {
      const newQty = existing.quantity + qty;
      if (product.quantity < newQty)
        return sendError(res, 400, `Only ${product.quantity} ${product.quantityUnit} available. You already have ${existing.quantity} in cart.`);
      existing.quantity = newQty;
    } else {
      cart.items.push({
        product: product._id,
        farmer: product.farmer._id,
        productName: product.name,
        priceAtAdd: product.price,
        priceUnit: product.priceUnit,
        quantity: qty,
      });
    }

    await cart.save();
    return sendSuccess(res, 200, `"${product.name}" added to cart.`, { itemCount: cart.items.length });
  } catch (err) {
    console.error('addToCart error:', err);
    return sendError(res, 500, 'Failed to add to cart.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/buyer/cart/:itemId
// Body: { quantity }
// ─────────────────────────────────────────────────────────────────────────────
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity);
    if (!qty || qty < 1) return sendError(res, 400, 'Quantity must be at least 1.');

    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) return sendError(res, 404, 'Cart not found.');

    const item = cart.items.id(req.params.itemId);
    if (!item) return sendError(res, 404, 'Item not found in cart.');

    const product = await Product.findOne({ _id: item.product, status: 'active' });
    if (!product) return sendError(res, 400, 'This product is no longer available.');
    if (product.quantity < qty)
      return sendError(res, 400, `Only ${product.quantity} ${product.quantityUnit} available.`);

    item.quantity = qty;
    await cart.save();

    return sendSuccess(res, 200, 'Cart updated.', { itemCount: cart.items.length });
  } catch (err) {
    console.error('updateCartItem error:', err);
    return sendError(res, 500, 'Failed to update cart.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/buyer/cart/:itemId
// ─────────────────────────────────────────────────────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user.id });
    if (!cart) return sendError(res, 404, 'Cart not found.');

    const before = cart.items.length;
    cart.items = cart.items.filter((i) => String(i._id) !== req.params.itemId);
    if (cart.items.length === before) return sendError(res, 404, 'Item not found in cart.');

    await cart.save();
    return sendSuccess(res, 200, 'Item removed from cart.', { itemCount: cart.items.length });
  } catch (err) {
    console.error('removeFromCart error:', err);
    return sendError(res, 500, 'Failed to remove item.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/buyer/cart
// Clear entire cart
// ─────────────────────────────────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ buyer: req.user.id }, { $set: { items: [] } }, { upsert: true });
    return sendSuccess(res, 200, 'Cart cleared.');
  } catch (err) {
    console.error('clearCart error:', err);
    return sendError(res, 500, 'Failed to clear cart.');
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
