const mongoose = require('mongoose');

/**
 * CropAdvice — a crop-specific advisory record created by an Expert.
 * Can be linked to a Consultation or Disease Case, or stand-alone.
 */
const cropAdviceSchema = new mongoose.Schema(
  {
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional: link to a consultation or disease case
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
    },
    diseaseCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiseaseCase',
      default: null,
    },

    // ── Crop context ─────────────────────────────────────────────────────────
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      maxlength: 150,
    },
    growthStage: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null, // e.g., 'germination', 'vegetative', 'flowering', 'harvest'
    },
    soilInfo: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    weatherConditions: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    observedProblem: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    // ── Expert advice content ─────────────────────────────────────────────────
    recommendedActions: {
      type: String,
      required: [true, 'Recommended actions are required'],
      trim: true,
      maxlength: 3000,
    },
    irrigationAdvice: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    nutrientAdvice: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    pestPrecautions: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    harvestAdvice: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  { timestamps: true }
);

cropAdviceSchema.index({ expert: 1 });
cropAdviceSchema.index({ farmer: 1 });
cropAdviceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CropAdvice', cropAdviceSchema);
