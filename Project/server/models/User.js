const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    bio: { type: String, default: '', maxlength: 300 },
    phone: { type: String, default: '' },
    altPhone: { type: String, default: '' },
    altEmail: { type: String, default: '' },
    avatar: { type: String, default: '' },
    age: { type: Number, default: null },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    dob: { type: Date, default: null },
    location: {
      address: { type: String, default: '' },
      address2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      zipcode: { type: String, default: '' },
      coordinates: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number],
      },
    },
    profileComplete: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    itemsShared: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    // Cart & Wishlist
    cart: [{ item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, quantity: { type: Number, default: 1 }, addedAt: { type: Date, default: Date.now } }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    // Referral & Gift Codes
    referralCode: { type: String, unique: true, sparse: true },
    giftCodes: [{
      code: { type: String },
      discountPercentage: { type: Number },
      isUsed: { type: Boolean, default: false }
    }],
  },
  { timestamps: true }
);

userSchema.index({ 'location.coordinates': '2dsphere' });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
