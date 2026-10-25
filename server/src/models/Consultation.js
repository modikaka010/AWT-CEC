const mongoose = require('mongoose');

/**
 * Consultation — a formal agricultural advisory session between a Farmer and an Expert.
 *
 * Lifecycle:
 *   Farmer creates request (status: pending)
 *     → Expert accepts (status: accepted)
 *     → Expert provides advice, marks complete (status: completed)
 *   OR Expert rejects (status: rejected)
 *   OR Farmer cancels (status: cancelled)
 */
const consultationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // assigned when expert accepts
    },
    // ── Request details (filled by farmer) ──────────────────────────────────
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      maxlength: 150,
    },
    problemTitle: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 3000,
    },
    symptoms: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', default: null },
    category: {
      type: String,
      enum: ['disease', 'pest', 'soil', 'nutrient', 'irrigation', 'weather', 'other'],
      default: 'other',
    },
    cropStage: { type: String, trim: true, maxlength: 60, default: '' },
    // Farmer's farm/location snapshot for context
    farmLocation: {
      type: String,
      trim: true,
      default: null,
    },
    // Images uploaded by farmer
    images: [{ type: String }],

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    // ── Status workflow ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },

    // ── Expert response ─────────────────────────────────────────────────────
    expertResponse: {
      diagnosis: { type: String, default: null, maxlength: 3000 },
      advice: { type: String, default: null, maxlength: 3000 },
      recommendedActions: { type: String, default: null, maxlength: 2000 },
      precautions: { type: String, default: null, maxlength: 2000 },
      followUp: { type: String, default: null, maxlength: 1000 },
      respondedAt: { type: Date, default: null },
    },

    // ── Rejection / cancellation ────────────────────────────────────────────
    rejectionReason: {
      type: String,
      default: null,
      maxlength: 500,
    },
    cancellationReason: {
      type: String,
      default: null,
      maxlength: 500,
    },

    // ── Timestamps for lifecycle stages ─────────────────────────────────────
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

consultationSchema.index({ farmer: 1, status: 1 });
consultationSchema.index({ expert: 1, status: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ createdAt: -1 });

consultationSchema.statics.CATEGORIES = ['disease', 'pest', 'soil', 'nutrient', 'irrigation', 'weather', 'other'];

module.exports = mongoose.model('Consultation', consultationSchema);
