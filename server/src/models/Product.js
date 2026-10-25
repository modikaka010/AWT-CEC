const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Grains & Cereals',
        'Vegetables',
        'Fruits',
        'Pulses & Legumes',
        'Oilseeds',
        'Spices & Herbs',
        'Dairy & Livestock',
        'Flowers',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceUnit: {
      type: String,
      default: 'per kg',
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    quantityUnit: {
      type: String,
      default: 'kg',
      trim: true,
    },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'sold', 'hidden', 'draft'],
      default: 'active',
    },
    hiddenReason: {
      type: String,
      default: null,
    },
    hiddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    location: {
      state: { type: String, default: null },
      district: { type: String, default: null },
      pincode: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ farmer: 1 });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
