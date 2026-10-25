const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Crop Science',
        'Market Prices',
        'Government Policy',
        'Technology',
        'Weather',
        'Organic Farming',
        'Livestock',
        'General',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      trim: true,
      default: 'Avelia',
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: null,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
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

newsSchema.index({ status: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ publishedDate: -1 });
newsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('News', newsSchema);
