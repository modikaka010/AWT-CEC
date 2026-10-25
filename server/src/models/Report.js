const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // What type of entity is being reported
    targetType: {
      type: String,
      enum: ['user', 'product', 'order', 'expert', 'other'],
      required: true,
    },
    // Reference ID of the reported entity (User, Product, Order, etc.)
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Human-readable label for the target (snapshot)
    targetLabel: {
      type: String,
      default: null,
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'rejected'],
      default: 'pending',
    },
    // Admin who handled this report
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, 'Resolution note cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ targetType: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
