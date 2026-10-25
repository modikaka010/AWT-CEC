const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // null recipient = broadcast / admin-only notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Category of notification for filtering
    type: {
      type: String,
      enum: [
        'expert_registration',        // new expert signup
        'expert_approved',            // admin approved expert
        'expert_rejected',            // admin rejected expert
        'new_order',                  // new order placed
        'order_status',               // order status change
        'new_report',                 // new complaint/report
        'product_hidden',             // admin hid a product
        'system',                     // general platform notification
        'content',                    // news / scheme published
        // Expert module types
        'consultation_request',       // farmer sent a new consultation request
        'consultation_accepted',      // expert accepted consultation
        'consultation_rejected',      // expert rejected consultation
        'consultation_completed',     // expert completed consultation
        'consultation_cancelled',     // farmer cancelled consultation
        'disease_case_assigned',      // disease case assigned to expert
        'disease_case_updated',       // expert updated a disease case
        'crop_advice_submitted',      // expert submitted crop advice
        // Buyer module types
        'order_placed',               // buyer placed a new order
        'order_confirmed',            // farmer/admin confirmed order
        'order_shipped',              // order shipped
        'order_delivered',            // order delivered
        'order_cancelled',            // order cancelled
        'new_message',                // new chat message received
        // Farmer module types
        'new_order',                  // farmer received a new order (already exists as new_order)
        'order_confirmed',            // farmer confirmed an order
        'order_status_updated',       // farmer updated order status
      ],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    // Optional link to the relevant resource
    link: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Per-admin read receipts for legacy platform-wide notifications.
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
