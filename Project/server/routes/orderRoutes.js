const express = require('express');
const Order = require('../models/Order');
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// ── Cart ──
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'cart.item', populate: { path: 'owner', select: 'name email avatar location' } });
    res.json({ cart: user.cart.filter(c => c.item) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/cart', protect, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.user._id);
    const exists = user.cart.find(c => c.item.toString() === itemId);
    if (exists) return res.status(400).json({ error: 'Item already in cart' });
    user.cart.push({ item: itemId });
    await user.save();
    res.json({ message: 'Added to cart', cart: user.cart });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/cart/:itemId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { cart: { item: req.params.itemId } } });
    res.json({ message: 'Removed from cart' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Wishlist ──
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'wishlist', populate: { path: 'owner', select: 'name email avatar' } });
    res.json({ wishlist: user.wishlist });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/wishlist', protect, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(itemId)) return res.status(400).json({ error: 'Item already in wishlist' });
    user.wishlist.push(itemId);
    await user.save();
    res.json({ message: 'Added to wishlist' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/wishlist/:itemId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.itemId } });
    res.json({ message: 'Removed from wishlist' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

  // ── Orders ──
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, address, paymentMethod, giftCode, days } = req.body;
    const item = await Item.findById(itemId).populate('owner', 'name email');
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const user = await User.findById(req.user._id);

    const txType = item.transactionType;
    const hasDeposit = ['rent', 'borrow', 'share'].includes(txType);
    const isExchange = txType === 'exchange';
    const isDonate = txType === 'donate';
    const numDays = days || 0;
    
    // Per day rates
    const perDayRate = txType === 'rent' ? (item.rentPerDay || 0) : txType === 'borrow' ? (item.borrowPerDay || 0) : txType === 'share' ? (item.sharePerDay || 0) : 0;
    
    // Calculate base price
    const basePrice = (perDayRate > 0 && numDays > 0)
      ? perDayRate * numDays
      : (isExchange || isDonate) ? 0 : (item.price || 0);

    const mrp = basePrice;
    
    // Deposit
    const depositAmount = hasDeposit ? (item.deposit || item.mrp || 0) : 0;

    const platformFee = isDonate || isExchange ? 10 : Math.round(mrp * 0.02);
    const deliveryFee = mrp > 500 ? 0 : 49;
    const tax = isDonate || isExchange ? Math.round((platformFee + deliveryFee) * 0.05) : Math.round(mrp * 0.05);

    let discount = 0;
    
    // Verify and apply gift code
    if (giftCode) {
      const codeIndex = user.giftCodes.findIndex(gc => gc.code === giftCode.toUpperCase() && !gc.isUsed);
      if (codeIndex !== -1) {
        const discountPercent = user.giftCodes[codeIndex].discountPercentage;
        discount = Math.round(basePrice * (discountPercent / 100));
        user.giftCodes[codeIndex].isUsed = true;
        user.markModified('giftCodes');
      }
    }

    const subtotal = mrp + platformFee + deliveryFee + tax - discount;
    const total = Math.max(0, subtotal + depositAmount);

    const order = await Order.create({
      buyer: req.user._id,
      seller: item.owner._id,
      item: item._id,
      mrp, platformFee, deliveryFee, tax, discount, deposit: depositAmount, days: numDays, total,
      address: address || {},
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      status: 'placed',
    });

    // Update item status
    await Item.findByIdAndUpdate(itemId, { status: 'sold' });
    // Remove from cart
    user.cart = user.cart.filter(c => c.item && c.item.toString() !== itemId);
    await user.save();

    const populated = await Order.findById(order._id)
      .populate('item', 'title images price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    res.status(201).json({ order: populated });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// My orders (as buyer)
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('item', 'title images price category')
      .populate('seller', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Orders received (as seller)
router.get('/received', protect, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('item', 'title images price category')
      .populate('buyer', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update order status (seller or admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    order.status = status;
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    if (status === 'cancelled') {
      await Item.findByIdAndUpdate(order.item, { status: 'available' });
    }
    await order.save();
    res.json({ order });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Request return (buyer, within 7 days of delivery)
router.post('/:id/return', protect, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Can only return delivered orders' });
    }
    // Check 7-day window
    const deliveryDate = order.deliveredAt || order.updatedAt;
    const daysSinceDelivery = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return res.status(400).json({ error: 'Return window has expired (7 days after delivery)' });
    }
    order.status = 'return_requested';
    order.returnReason = reason || '';
    order.returnDescription = description || '';
    await order.save();
    res.json({ order, message: 'Return request submitted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// File a dispute (buyer)
router.post('/:id/dispute', protect, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (!['delivered', 'shipped'].includes(order.status)) {
      return res.status(400).json({ error: 'Can only dispute delivered or shipped orders' });
    }
    order.status = 'disputed';
    order.disputeReason = reason || '';
    order.disputeDescription = description || '';
    order.disputeStatus = 'open';
    await order.save();
    res.json({ order, message: 'Dispute filed successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: Get all orders (for deliveries view)
router.get('/admin/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('item', 'title images price category transactionType')
      .populate('buyer', 'name email avatar location')
      .populate('seller', 'name email avatar location')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: Get disputed/return orders
router.get('/admin/disputes', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const orders = await Order.find({ status: { $in: ['disputed', 'return_requested'] } })
      .populate('item', 'title images price')
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ disputes: orders });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: Resolve a dispute/return
router.put('/admin/disputes/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { resolution, newStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.disputeStatus = 'resolved';
    order.disputeResolution = resolution || 'Resolved by admin';
    order.status = newStatus || 'delivered';
    await order.save();
    const populated = await Order.findById(order._id)
      .populate('item', 'title images price')
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar');
    res.json({ order: populated });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
