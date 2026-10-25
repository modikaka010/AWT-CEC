const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      maxlength: [300, 'Scheme name cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    eligibility: {
      type: String,
      trim: true,
      maxlength: [2000, 'Eligibility cannot exceed 2000 characters'],
      default: '',
    },
    benefits: {
      type: String,
      trim: true,
      maxlength: [2000, 'Benefits cannot exceed 2000 characters'],
      default: '',
    },
    applicationInfo: {
      type: String,
      trim: true,
      maxlength: [2000, 'Application info cannot exceed 2000 characters'],
      default: '',
    },
    officialLink: {
      type: String,
      trim: true,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['Central', 'State', 'Insurance', 'Credit', 'Subsidy', 'Training', 'Other'],
      default: 'Central',
    },
    targetAudience: {
      type: [String],
      enum: ['farmer', 'buyer', 'expert', 'all'],
      default: ['farmer'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'hidden'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Disclaimer: Avelia provides informational access only.
// It is not officially affiliated with any government scheme.
schemeSchema.index({ status: 1 });
schemeSchema.index({ category: 1 });
schemeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Scheme', schemeSchema);
