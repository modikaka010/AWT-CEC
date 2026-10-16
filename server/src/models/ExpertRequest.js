const mongoose = require('mongoose');

/**
 * ExpertRequest tracks the admin review lifecycle for each expert registration.
 * A separate document from User keeps the review audit trail clean.
 */
const expertRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Snapshot of expert info at time of request (avoids joins)
    name: { type: String, required: true },
    email: { type: String, required: true },
    specialization: { type: String, default: null },
    qualifications: { type: String, default: null },
    experience: { type: String, default: null },
    organization: { type: String, default: null },
    documentUrls: [{ type: String }],

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

expertRequestSchema.index({ status: 1 });
expertRequestSchema.index({ user: 1 });

module.exports = mongoose.model('ExpertRequest', expertRequestSchema);
