const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const notify = async (opts) => {
  try {
    await Notification.create(opts);
  } catch (err) {
    console.error('Chat notification creation failed:', err.message);
  }
};

const allowedPeerRoles = (role) => {
  if (role === 'farmer') return ['farmer', 'buyer'];
  if (role === 'buyer') return ['farmer'];
  return [];
};

const findAllowedPeer = async (req, peerId) => {
  if (!mongoose.isValidObjectId(peerId) || String(peerId) === String(req.user.id)) return null;
  return User.findOne({
    _id: peerId,
    role: { $in: allowedPeerRoles(req.user.role) },
    status: 'active',
  }).select('name loginId role').lean();
};

// GET /api/{farmer|buyer}/chat/users
// Farmers can contact farmers and buyers; buyers can contact farmers.
const getChatUsers = async (req, res) => {
  try {
    const roles = allowedPeerRoles(req.user.role);
    if (!roles.length) return sendError(res, 403, 'Your role cannot access direct chat.');

    const users = await User.find({
      _id: { $ne: req.user.id },
      role: { $in: roles },
      status: 'active',
    })
      .select('name loginId role')
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, 200, 'Chat contacts fetched.', { users });
  } catch (err) {
    console.error('getChatUsers error:', err);
    return sendError(res, 500, 'Failed to fetch chat contacts.');
  }
};

// GET /api/{farmer|buyer}/chat/conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const message = conversation.lastMessage;
        const otherId = String(message.sender) === String(userId) ? message.receiver : message.sender;
        const participant = await findAllowedPeer(req, otherId);
        if (!participant) return null;

        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          receiver: userId,
          isRead: false,
        });

        return {
          conversationId: conversation._id,
          participant,
          lastMessage: message,
          unreadCount,
        };
      })
    );

    return sendSuccess(res, 200, 'Conversations fetched.', {
      conversations: enriched.filter(Boolean),
    });
  } catch (err) {
    console.error('getConversations error:', err);
    return sendError(res, 500, 'Failed to fetch conversations.');
  }
};

// GET /api/{farmer|buyer}/chat/:userId?page=1&limit=50
const getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;
    const other = await findAllowedPeer(req, otherId);
    if (!other) return sendError(res, 404, 'Chat participant not found.');

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const conversationId = Message.buildConversationId(myId, otherId);
    const participantsFilter = {
      conversationId,
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    };

    const [messages, total] = await Promise.all([
      Message.find(participantsFilter)
        .populate('sender', 'name')
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Message.countDocuments(participantsFilter),
    ]);

    await Message.updateMany(
      { ...participantsFilter, receiver: myId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return sendSuccess(res, 200, 'Messages fetched.', {
      messages,
      participant: other,
      conversationId,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getMessages error:', err);
    return sendError(res, 500, 'Failed to fetch messages.');
  }
};

// POST /api/{farmer|buyer}/chat/:userId
// Body: { text, imageUrl }
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.userId;
    const { text, imageUrl } = req.body;
    const messageText = typeof text === 'string' ? text.trim() : '';
    const attachment = typeof imageUrl === 'string' ? imageUrl.trim() : '';

    if (!messageText && !attachment) {
      return sendError(res, 400, 'Message text or image is required.');
    }
    if (messageText.length > 2000) return sendError(res, 400, 'Message cannot exceed 2000 characters.');

    const receiver = await findAllowedPeer(req, receiverId);
    if (!receiver) return sendError(res, 404, 'Chat participant not found.');

    const conversationId = Message.buildConversationId(senderId, receiverId);
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      conversationId,
      text: messageText || null,
      imageUrl: attachment || null,
    });

    const chatPath = receiver.role === 'farmer' ? '/farmer/chat' : '/buyer/chat';
    void notify({
      recipient: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: 'You have a new message.',
      link: `${chatPath}/${senderId}`,
    });

    return sendSuccess(res, 201, 'Message sent.', { message });
  } catch (err) {
    console.error('sendMessage error:', err);
    return sendError(res, 500, 'Failed to send message.');
  }
};

module.exports = { getChatUsers, getConversations, getMessages, sendMessage };
