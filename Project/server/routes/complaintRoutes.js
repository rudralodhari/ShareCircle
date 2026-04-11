const express = require('express');
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');

const router = express.Router();

// File a complaint (User)
router.post('/', protect, async (req, res) => {
  try {
    const { subject, category, description, againstUser } = req.body;
    const complaint = await Complaint.create({
      user: req.user._id,
      subject,
      category,
      description: againstUser ? `Against user: ${againstUser}\n\n${description}` : description,
    });
    res.status(201).json({ complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all complaints
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized as an admin' });
  }
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update complaint status
router.put('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized as an admin' });
  }
  try {
    const { status, adminNotes } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: { status, adminNotes } },
      { new: true, runValidators: true }
    );
    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
