const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, admin);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const activeListings = await Item.countDocuments({ status: 'available' });
    const totalTransactions = await Transaction.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Recent signups (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Items by category
    const categoryStats = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Items by transaction type
    const typeStats = await Item.aggregate([
      { $group: { _id: '$transactionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Build recent activity feed dynamically from different collections
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(3).select('name createdAt');
    const recentItems = await Item.find().sort({ createdAt: -1 }).limit(3).select('title createdAt');
    const recentDisputes = await Transaction.find({ status: 'disputed' }).sort({ createdAt: -1 }).limit(3).select('_id createdAt');
    
    let recentActivity = [];
    
    recentUsers.forEach(u => {
      recentActivity.push({
        id: `user-${u._id}`, type: 'user', icon: 'bi-person-plus', color: '#3b82f6',
        text: `New user "${u.name}" registered`,
        date: u.createdAt
      });
    });
    
    recentItems.forEach(i => {
      recentActivity.push({
        id: `item-${i._id}`, type: 'listing', icon: 'bi-plus-circle', color: '#10b981',
        text: `New item "${i.title}" was listed`,
        date: i.createdAt
      });
    });
    
    recentDisputes.forEach(d => {
      recentActivity.push({
        id: `disp-${d._id}`, type: 'dispute', icon: 'bi-exclamation-triangle', color: '#f59e0b',
        text: `Dispute opened on transaction #${d._id.toString().slice(-6)}`,
        date: d.createdAt
      });
    });
    
    // Sort combined activities by date descending
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    recentActivity = recentActivity.slice(0, 6); // Keep top 6 most recent

    res.json({
      totalUsers,
      totalItems,
      activeListings,
      totalTransactions,
      bannedUsers,
      newUsers,
      categoryStats,
      typeStats,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, q, role } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban or unban a user
// @access  Admin
router.put('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle ban status
    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
      },
      message: user.isBanned ? 'User has been banned' : 'User has been unbanned',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/admin/disputes
// @desc    Get all disputed transactions
// @access  Admin
router.get('/disputes', async (req, res) => {
  try {
    const disputes = await Transaction.find({ status: 'disputed' })
      .populate('item', 'title images')
      .populate('requester', 'name email avatar')
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ disputes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/admin/disputes/:id
// @desc    Resolve a dispute
// @access  Admin
router.put('/disputes/:id', async (req, res) => {
  try {
    const { resolution, status } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: status || 'completed',
        notes: resolution || 'Resolved by admin',
      },
      { new: true }
    )
      .populate('item', 'title')
      .populate('requester', 'name email')
      .populate('owner', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/admin/items
// @desc    Get all items for admin
// @access  Admin
router.get('/items', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
