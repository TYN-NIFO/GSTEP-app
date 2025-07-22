const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/chat/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const query = req.user.role === 'alumni' 
      ? { alumni: req.user.id }
      : { student: req.user.id };

    const conversations = await Chat.find(query)
      .populate('alumni', 'name email department graduationYear currentCompany position')
      .populate('student', 'name email department')
      .sort({ lastMessage: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/chat/start/:userId
// @desc    Start a new conversation
// @access  Private
router.post('/start/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if conversation already exists
    const existingChat = await Chat.findOne({
      $or: [
        { alumni: req.user.role === 'alumni' ? req.user.id : otherUserId, student: req.user.role === 'student' ? req.user.id : otherUserId },
        { alumni: req.user.role === 'student' ? otherUserId : req.user.id, student: req.user.role === 'alumni' ? otherUserId : req.user.id }
      ]
    });

    if (existingChat) {
      return res.json({ success: true, chatId: existingChat._id });
    }

    // Create new conversation
    const newChat = new Chat({
      alumni: req.user.role === 'alumni' ? req.user.id : otherUserId,
      student: req.user.role === 'student' ? req.user.id : otherUserId,
      messages: []
    });

    await newChat.save();
    res.json({ success: true, chatId: newChat._id });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/chat/:chatId/messages
// @desc    Get messages for a conversation
// @access  Private
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'name')
      .populate('alumni', 'name')
      .populate('student', 'name');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Mark messages as read
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user.id) {
        msg.isRead = true;
      }
    });
    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/chat/:chatId/message
// @desc    Send a message in a conversation
// @access  Private
router.post('/:chatId/message', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const newMessage = {
      sender: req.user.id,
      content,
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate sender info for response
    await chat.populate('messages.sender', 'name');
    const message = chat.messages[chat.messages.length - 1];

    res.json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
