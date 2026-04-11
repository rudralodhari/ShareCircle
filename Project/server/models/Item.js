const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    mrp: {
      type: Number,
      default: 0,
      min: 0,
    },
    deposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    rentPerDay: {
      type: Number,
      default: 0,
      min: 0,
    },
    borrowPerDay: {
      type: Number,
      default: 0,
      min: 0,
    },
    sharePerDay: {
      type: Number,
      default: 0,
      min: 0,
    },
    wantInReturn: {
      type: String,
      default: '',
      maxlength: 500,
    },
    wantInReturnImage: {
      type: String,
      default: '',
    },
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['buy', 'sell', 'rent', 'borrow', 'share', 'exchange', 'donate'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports',
        'Garden', 'Kitchen', 'Tools', 'Toys', 'Vehicles', 'Other',
      ],
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    },
    images: [{ type: String }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      city: { type: String, default: '' },
      address: { type: String, default: '' },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [72.5714, 23.0225] }, // Default: Ahmedabad
      },
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'completed', 'removed'],
      default: 'available',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Geospatial index for nearby searches
itemSchema.index({ 'location.coordinates': '2dsphere' });

// Text index for search
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
