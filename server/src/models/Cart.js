const mongoose = require('mongoose');

/**
 * Cart — persisted shopping cart for a Buyer.
 * One cart per buyer. Items reference Products.
 * Quantity is validated again at checkout time.
 */
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Snapshot the farmer so we can group by farmer at checkout
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Snapshot name/price at time of adding (shown in cart UI)
    productName: { type: String, required: true },
    priceAtAdd:  { type: Number, required: true },
    priceUnit:   { type: String, default: 'per kg' },
    quantity:    { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one cart per buyer
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

cartSchema.index({ buyer: 1 });

module.exports = mongoose.model('Cart', cartSchema);
