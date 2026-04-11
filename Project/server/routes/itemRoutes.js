const express = require('express');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { itemRules } = require('../middleware/validate');

const router = express.Router();

// ── Multer config for image uploads ──
const uploadDir = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
  },
});

// @route   POST /api/items/upload-images
// @desc    Upload item images
// @access  Private
router.post('/upload-images', protect, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded' });
  }
  const imagePaths = req.files.map((f) => `/images/products/${f.filename}`);
  res.json({ success: true, images: imagePaths });
});

// @route   GET /api/items
// @desc    Get all items with filters, search, pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category, type, condition, status,
      q, sort, page = 1, limit = 12,
    } = req.query;

    const query = {};

    // Only show available items by default
    query.status = status || 'available';

    if (category) query.category = category;
    if (type) query.transactionType = type;
    if (condition) query.condition = condition;

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    // Sort
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    if (sort === 'price_high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { views: -1 };

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('owner', 'name email avatar rating location')
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/items/search
// @desc    Search items
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ items: [] });

    const items = await Item.find({
      status: 'available',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('owner', 'name email avatar rating')
      .limit(20);

    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/items/recommended
// @desc    Get recommended items
// @access  Public
router.get('/recommended', async (req, res) => {
  try {
    const items = await Item.find({ status: 'available' })
      .populate('owner', 'name email avatar rating')
      .sort({ views: -1, createdAt: -1 })
      .limit(8);

    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name email avatar rating reviewCount location bio createdAt');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Increment view count
    item.views += 1;
    await item.save();

    res.json({ item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/items
// @desc    Create a new item
// @access  Private
router.post('/', protect, itemRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const {
      title, description, price, mrp, deposit, rentPerDay, borrowPerDay,
      wantInReturn, wantInReturnImage,
      transactionType, category, condition, images, location,
    } = req.body;

    const item = await Item.create({
      title,
      description,
      price: price || 0,
      mrp: mrp || 0,
      deposit: deposit || 0,
      rentPerDay: rentPerDay || 0,
      borrowPerDay: borrowPerDay || 0,
      wantInReturn: wantInReturn || '',
      wantInReturnImage: wantInReturnImage || '',
      transactionType,
      category,
      condition,
      images: images || [],
      owner: req.user._id,
      location: location || { city: req.user.location?.city || '' },
    });

    // Increment user's itemsShared count
    await User.findByIdAndUpdate(req.user._id, { $inc: { itemsShared: 1 } });

    const populated = await Item.findById(item._id)
      .populate('owner', 'name email avatar rating');

    res.status(201).json({ item: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check ownership
    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar rating');

    res.json({ item: updatedItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check ownership or admin
    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    // Decrement user's itemsShared
    await User.findByIdAndUpdate(item.owner, { $inc: { itemsShared: -1 } });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
