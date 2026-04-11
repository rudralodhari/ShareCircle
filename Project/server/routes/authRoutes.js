const express = require('express');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validate');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerRules, async (req, res) => {
  try {
    // Check validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate unique referral code
    const baseCode = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    let newReferralCode = `${baseCode}${Math.floor(100 + Math.random() * 900)}`;
    while (await User.findOne({ referralCode: newReferralCode })) {
      newReferralCode = `${baseCode}${Math.floor(100 + Math.random() * 900)}`;
    }

    const giftCodes = [
      { code: 'WELCOME10', discountPercentage: 10, isUsed: false }
    ];

    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        giftCodes.push({ code: 'NEW5', discountPercentage: 5, isUsed: false });
      }
    }

    // Create user
    const user = await User.create({ name, email, password, referralCode: newReferralCode, giftCodes });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        location: user.location,
        rating: user.rating,
        reviewCount: user.reviewCount,
        itemsShared: user.itemsShared,
        referralCode: user.referralCode,
        giftCodes: user.giftCodes,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & return token
// @access  Public
router.post('/login', loginRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is banned
    if (user.isBanned && user.role !== 'admin') {
      return res.status(403).json({ error: 'Your account has been banned' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Lazy generation for older accounts
    if (!user.referralCode) {
      const baseCode = user.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
      let newReferralCode = `${baseCode}${Math.floor(100 + Math.random() * 900)}`;
      while (await User.findOne({ referralCode: newReferralCode })) {
        newReferralCode = `${baseCode}${Math.floor(100 + Math.random() * 900)}`;
      }
      user.referralCode = newReferralCode;
      if (!user.giftCodes || user.giftCodes.length === 0) {
        user.giftCodes = [{ code: 'WELCOME10', discountPercentage: 10, isUsed: false }];
      }
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
        location: user.location,
        rating: user.rating,
        reviewCount: user.reviewCount,
        itemsShared: user.itemsShared,
        profileComplete: user.profileComplete || false,
        isBanned: user.isBanned,
        gender: user.gender,
        age: user.age,
        dob: user.dob,
        referralCode: user.referralCode,
        giftCodes: user.giftCodes,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);

    // Lazy generation for older accounts
    if (!user.referralCode) {
      const baseCode = user.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
      let newReferralCode = `${baseCode}${Math.floor(100 + Math.random() * 900)}`;
      while (await User.findOne({ referralCode: newReferralCode })) {
        newReferralCode = `${baseCode}${Math.floor(100 + Math.random() * 900)}`;
      }
      user.referralCode = newReferralCode;
      if (!user.giftCodes || user.giftCodes.length === 0) {
        user.giftCodes = [{ code: 'WELCOME10', discountPercentage: 10, isUsed: false }];
      }
      await user.save();
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
        location: user.location,
        rating: user.rating,
        reviewCount: user.reviewCount,
        itemsShared: user.itemsShared,
        referralCode: user.referralCode,
        giftCodes: user.giftCodes,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
