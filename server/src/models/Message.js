const mongoose = require('mongoose');

/**
 * Message — a single direct chat message between two users.
 * Messages are grouped by a conversation key: sorted(userId1, userId2).
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Stable conversation ID = sorted IDs joined with '_'
    // e.g. "507f1f77_507f1f78"  (always same regardless of who initiates)
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    // Optional image attachment (URL path like /uploads/chat/...)
    imageUrl: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

/**
 * Static helper — build a stable conversation ID from two user IDs.
 * Sorts them so the key is the same regardless of who initiates.
 */
messageSchema.statics.buildConversationId = function (idA, idB) {
  return [String(idA), String(idB)].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);
