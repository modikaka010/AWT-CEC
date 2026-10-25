const mongoose = require('mongoose');

/**
 * DiseaseCase — a disease/pest report submitted by a Farmer for expert review.
 * This is agricultural guidance, not a guaranteed medical/scientific diagnosis.
 *
 * Lifecycle: pending → under_review → diagnosed → closed
 */
const diseaseCaseSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // assigned when expert picks it up
    },

    // ── Farmer-submitted case details ────────────────────────────────────────
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      maxlength: 150,
    },
    plantPart: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null, // e.g., 'leaves', 'stem', 'root', 'fruit'
    },
    symptoms: {
      type: String,
      required: [true, 'Symptoms description is required'],
      trim: true,
      maxlength: 2000,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },
    images: [{ type: String }],
    farmLocation: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Status workflow ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'under_review', 'diagnosed', 'closed'],
      default: 'pending',
    },

    // ── Expert diagnosis and advice ──────────────────────────────────────────
    expertAdvice: {
      possibleDisease: { type: String, default: null, maxlength: 500 },
      diagnosis: { type: String, default: null, maxlength: 3000 },
      treatment: { type: String, default: null, maxlength: 2000 },
      precautions: { type: String, default: null, maxlength: 2000 },
      followUp: { type: String, default: null, maxlength: 1000 },
      advisedAt: { type: Date, default: null },
    },

    // disclaimer: always shown — this is guidance, not a guaranteed diagnosis
    disclaimer: {
      type: String,
      default:
        'This advice is based on the information provided and is intended as agricultural guidance only. Results may vary based on local conditions. Consult a certified agronomist for critical decisions.',
    },
  },
  { timestamps: true }
);

diseaseCaseSchema.index({ farmer: 1, status: 1 });
diseaseCaseSchema.index({ expert: 1, status: 1 });
diseaseCaseSchema.index({ status: 1 });
diseaseCaseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DiseaseCase', diseaseCaseSchema);
