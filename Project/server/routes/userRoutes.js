const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Item = require('../models/Item');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Avatar upload config ──
const avatarDir = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user._id}${path.extname(file.originalname)}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// @route   GET /api/users/stats
// @desc    Get current user stats, impact, and activity
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listings = await Item.countDocuments({ owner: req.user._id });
    const reviews = await Review.countDocuments({ reviewee: req.user._id });
    const Order = require('../models/Order');
    const transactions = await Order.countDocuments({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    });

    // Impact Calculations
    const itemsReused = await Order.countDocuments({ buyer: req.user._id, status: { $in: ['shipped', 'delivered', 'completed'] } });
    const impact = {
      itemsReused,
      co2Saved: itemsReused * 3.7, // Assume 3.7kg CO2 saved per reused item
      wasteDiverted: itemsReused * 2.5, // Assume 2.5kg waste diverted per reused item
    };

    // Synthesize Recent Activity
    let activityFeed = [];

    // 1. Recent Listings
    const recentListings = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(3);
    recentListings.forEach(l => activityFeed.push({
      id: `l_${l._id}`, type: 'listing', text: `You listed "${l.title}"`,
      icon: 'bi-plus-circle', color: 'var(--primary-500)', time: l.createdAt
    }));

    // 2. Recent Borrowing/Buying (Orders)
    const recentOrders = await Order.find({ buyer: req.user._id }).populate('item').sort({ createdAt: -1 }).limit(3);
    recentOrders.forEach(o => {
      if (o.item) {
        activityFeed.push({
          id: `o_${o._id}`, type: 'transaction', text: `You ordered "${o.item.title}"`,
          icon: 'bi-arrow-left-right', color: '#3B82F6', time: o.createdAt
        });
      }
    });

    // 3. Recent Reviews
    const recentReviews = await Review.find({ reviewee: req.user._id }).populate('reviewer').sort({ createdAt: -1 }).limit(3);
    recentReviews.forEach(r => {
      if (r.reviewer) {
        activityFeed.push({
          id: `r_${r._id}`, type: 'review', text: `${r.reviewer.name.split(' ')[0]} left you a ${r.rating}-star review`,
          icon: 'bi-star-fill', color: 'var(--accent-500)', time: r.createdAt
        });
      }
    });

    // Sort combined feed and take top 4
    activityFeed.sort((a, b) => b.time - a.time);
    activityFeed = activityFeed.slice(0, 4);

    res.json({
      listings,
      reviews,
      transactions,
      rating: user.rating,
      itemsShared: user.itemsShared,
      impact,
      activityFeed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update own profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, phone, altPhone, altEmail, age, gender, dob, address, address2, city, state, country, zipcode } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (altPhone !== undefined) updates.altPhone = altPhone;
    if (altEmail !== undefined) updates.altEmail = altEmail;
    if (age !== undefined) updates.age = age ? Number(age) : null;
    if (gender !== undefined) updates.gender = gender;
    if (dob !== undefined) updates.dob = dob || null;

    // Build full location object
    const currentLoc = req.user.location || {};
    updates.location = {
      address: address !== undefined ? address : currentLoc.address || '',
      address2: address2 !== undefined ? address2 : currentLoc.address2 || '',
      city: city !== undefined ? city : currentLoc.city || '',
      state: state !== undefined ? state : currentLoc.state || '',
      country: country !== undefined ? country : currentLoc.country || '',
      zipcode: zipcode !== undefined ? zipcode : currentLoc.zipcode || '',
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/users/complete-profile
// @desc    Step 2 of registration — collect all personal details
// @access  Private
router.put('/complete-profile', protect, async (req, res) => {
  try {
    const { phone, altPhone, altEmail, age, gender, dob, address, address2, city, state, country, zipcode } = req.body;

    const updates = {
      phone: phone || '',
      altPhone: altPhone || '',
      altEmail: altEmail || '',
      age: age || null,
      gender: gender || '',
      dob: dob || null,
      location: {
        address: address || '',
        address2: address2 || '',
        city: city || '',
        state: state || '',
        country: country || '',
        zipcode: zipcode || '',
      },
      profileComplete: true,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarPath = `/images/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarPath });

    res.json({ avatar: avatarPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/users/:id/reviews
// @desc    Get reviews for a user
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/users/:id/reviews
// @desc    Add a review for a user
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

    // Check if reviewee exists
    const reviewee = await User.findById(req.params.id);
    if (!reviewee) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: req.params.id,
      rating,
      comment: comment || '',
    });

    // Update user's rating
    const allReviews = await Review.find({ reviewee: req.params.id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(req.params.id, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name avatar');

    res.status(201).json({ review: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this user' });
    }
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/users/:id/listings
// @desc    Get listings by a specific user
// @access  Public
router.get('/:id/listings', async (req, res) => {
  try {
    const items = await Item.find({ owner: req.params.id })
      .populate('owner', 'name email avatar rating')
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
