const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar email')
      .populate('item', 'title images')
      .sort({ lastMessageAt: -1 });

    // Format for frontend — show the "other" participant
    const formatted = conversations.map((conv) => {
      const participant = conv.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      if (!participant) return null;
      return {
        _id: conv._id,
        participant,
        item: conv.item,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unread: 0, // simplified — no unread tracking for now
      };
    }).filter(Boolean);

    res.json({ conversations: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/chat/conversations
// @desc    Start a new conversation (or return existing one)
// @access  Private
router.post('/conversations', protect, async (req, res) => {
  try {
    const { recipientId, itemId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    // Check if conversation already exists between these users for this item
    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      ...(itemId ? { item: itemId } : {}),
    })
      .populate('participants', 'name avatar email')
      .populate('item', 'title images');

    if (existing) {
      const participant = existing.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      return res.json({
        conversation: {
          _id: existing._id,
          participant,
          item: existing.item,
          lastMessage: existing.lastMessage,
          lastMessageAt: existing.lastMessageAt,
        },
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      item: itemId || undefined,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar email')
      .populate('item', 'title images');

    const participant = populated.participants.find(
      (p) => p._id.toString() !== req.user._id.toString()
    );

    res.status(201).json({
      conversation: {
        _id: populated._id,
        participant,
        item: populated.item,
        lastMessage: '',
        lastMessageAt: populated.lastMessageAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/chat/conversations/:id/messages
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Format messages
    const formatted = messages.map((msg) => ({
      _id: msg._id,
      text: msg.text,
      isMine: msg.sender._id.toString() === req.user._id.toString(),
      sender: msg.sender,
      createdAt: msg.createdAt,
    }));

    res.json({ messages: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/chat/conversations/:id/messages
// @desc    Send a message
// @access  Private
router.post('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create message
    const msg = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      text: message.trim(),
    });

    // Update conversation
    conversation.lastMessage = message.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(msg._id)
      .populate('sender', 'name avatar');

    res.status(201).json({
      message: {
        _id: populated._id,
        text: populated.text,
        isMine: true,
        sender: populated.sender,
        createdAt: populated.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/chat/conversations/:id/read
// @desc    Mark conversation as read
// @access  Private
router.put('/conversations/:id/read', protect, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
