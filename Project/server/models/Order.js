const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, default: 1 },
    // Pricing
    mrp: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    days: { type: Number, default: 0 },
    total: { type: Number, required: true },
    // Delivery address
    address: {
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      zipcode: String,
      type: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
    },
    // Payment
    paymentMethod: {
      type: String,
      enum: ['upi', 'credit_card', 'debit_card', 'emi', 'net_banking', 'cod', 'gift_card'],
      default: 'cod',
    },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    // Order Status
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned', 'return_requested', 'disputed'],
      default: 'placed',
    },
    deliveredAt: { type: Date, default: null },
    notes: { type: String, default: '' },
    // Dispute fields
    disputeReason: { type: String, default: '' },
    disputeDescription: { type: String, default: '' },
    disputeStatus: { type: String, enum: ['', 'open', 'in_progress', 'resolved'], default: '' },
    disputeResolution: { type: String, default: '' },
    // Return fields
    returnReason: { type: String, default: '' },
    returnDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
