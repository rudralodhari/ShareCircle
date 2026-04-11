/**
 * Seed Script — Populates MongoDB with demo data
 * Run: node server/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Item = require('./models/Item');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sharecircle';

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@sharecircle.com',
    password: 'admin123',
    role: 'admin',
    bio: 'Platform administrator managing ShareCircle.',
    location: { city: 'Ahmedabad', address: 'Navrangpura' },
    isVerified: true,
  },
  {
    name: 'Demo User',
    email: 'user@sharecircle.com',
    password: 'demo123',
    role: 'user',
    bio: 'Eco-enthusiast sharing resources with my community.',
    location: { city: 'Ahmedabad', address: 'Satellite area' },
    rating: 4.8,
    reviewCount: 12,
    itemsShared: 5,
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'demo123',
    role: 'user',
    bio: 'Love gardening and outdoor activities.',
    location: { city: 'Ahmedabad', address: 'Satellite area' },
    rating: 4.5,
    reviewCount: 8,
    itemsShared: 3,
  },
  {
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    password: 'demo123',
    role: 'user',
    bio: 'Sports enthusiast and tech lover.',
    location: { city: 'Ahmedabad', address: 'SG Highway area' },
    rating: 4.7,
    reviewCount: 15,
    itemsShared: 4,
  },
  {
    name: 'Rahul Singh',
    email: 'rahul@example.com',
    password: 'demo123',
    role: 'user',
    bio: 'DIY enthusiast and handyman.',
    location: { city: 'Gandhinagar', address: 'Sector 21' },
    rating: 4.2,
    reviewCount: 6,
    itemsShared: 2,
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha@example.com',
    password: 'demo123',
    role: 'user',
    bio: 'Book worm and knowledge sharer.',
    location: { city: 'Ahmedabad', address: 'Navrangpura' },
    rating: 4.9,
    reviewCount: 20,
    itemsShared: 6,
  },
  {
    name: 'Dev Trivedi',
    email: 'dev@example.com',
    password: 'demo123',
    role: 'moderator',
    bio: 'Content moderator keeping ShareCircle safe.',
    location: { city: 'Vadodara', address: 'Alkapuri' },
    rating: 4.6,
    reviewCount: 3,
    itemsShared: 1,
  },
];

const seedItems = [
  {
    title: 'Garden Tools Set',
    description: 'Complete set of garden tools including spade, fork, and pruner. Great condition. Perfect for home gardeners who need quality tools without buying their own.',
    price: 0,
    transactionType: 'share',
    category: 'Garden',
    condition: 'good',
    location: { city: 'Ahmedabad', address: 'Satellite area' },
    images: ['/images/products/garden-tools.jpg'],
    ownerEmail: 'priya@example.com',
  },
  {
    title: 'Mountain Bicycle',
    description: 'Trek Marlin 5, barely used. Perfect for weekend rides. Comes with front suspension, 21-speed Shimano gears, and hydraulic disc brakes. Includes lock and helmet.',
    price: 8500,
    transactionType: 'sell',
    category: 'Sports',
    condition: 'like_new',
    location: { city: 'Ahmedabad', address: 'SG Highway area' },
    images: ['/images/products/mountain-bicycle.jpg'],
    ownerEmail: 'arjun@example.com',
  },
  {
    title: 'Power Drill',
    description: 'Bosch cordless drill with 2 batteries and a carrying case. Ideal for DIY home projects. Barely used, purchased last year.',
    price: 200,
    transactionType: 'rent',
    category: 'Tools',
    condition: 'good',
    location: { city: 'Gandhinagar', address: 'Sector 21' },
    images: ['/images/products/power-drill.jpg'],
    ownerEmail: 'rahul@example.com',
  },
  {
    title: 'Harry Potter Collection',
    description: 'Complete 7-book series, hardcover edition in excellent condition. Great for young readers or collectors. All books together as a set.',
    price: 0,
    transactionType: 'borrow',
    category: 'Books',
    condition: 'good',
    location: { city: 'Ahmedabad', address: 'Navrangpura' },
    images: ['/images/products/harry-potter-books.jpg'],
    ownerEmail: 'sneha@example.com',
  },
  {
    title: 'Standing Desk',
    description: 'Electric standing desk, adjustable height between 60-120cm. Minor scratches on the surface but fully functional. Great for home office setup.',
    price: 12000,
    transactionType: 'sell',
    category: 'Furniture',
    condition: 'fair',
    location: { city: 'Vadodara', address: 'Alkapuri' },
    images: ['/images/products/standing-desk.jpg'],
    ownerEmail: 'dev@example.com',
  },
  {
    title: 'Kids Toy Bundle',
    description: 'Assorted educational toys suitable for ages 3-6. Includes building blocks, puzzles, and art sets. All sanitized and in good condition.',
    price: 0,
    transactionType: 'donate',
    category: 'Toys',
    condition: 'good',
    location: { city: 'Ahmedabad', address: 'Bodakdev' },
    images: ['/images/products/kids-toys.jpg'],
    ownerEmail: 'user@sharecircle.com',
  },
  {
    title: 'MacBook Pro 2021',
    description: 'Apple MacBook Pro 14-inch, M1 Pro chip, 16GB RAM, 512GB SSD. Used for 1 year, excellent condition with all original accessories.',
    price: 95000,
    transactionType: 'sell',
    category: 'Electronics',
    condition: 'like_new',
    location: { city: 'Ahmedabad', address: 'Prahlad Nagar' },
    images: ['/images/products/macbook-pro.jpg'],
    ownerEmail: 'arjun@example.com',
  },
  {
    title: 'Yoga Mat',
    description: 'Liforme yoga mat, 4.2mm thick, non-slip surface. Used for 6 months. Perfect for yoga, pilates, or home workouts.',
    price: 0,
    transactionType: 'share',
    category: 'Sports',
    condition: 'good',
    location: { city: 'Ahmedabad', address: 'Bodakdev' },
    images: ['/images/products/yoga-mat.jpg'],
    ownerEmail: 'priya@example.com',
  },
  {
    title: 'Fiction Book Collection',
    description: 'Collection of 20 bestselling fiction novels including works by Chetan Bhagat, Amish Tripathi, and more. Perfect for avid readers.',
    price: 500,
    transactionType: 'sell',
    category: 'Books',
    condition: 'good',
    location: { city: 'Ahmedabad', address: 'Navrangpura' },
    images: ['/images/products/fiction-books.jpg'],
    ownerEmail: 'sneha@example.com',
  },
  {
    title: 'Camping Tent',
    description: '4-person dome tent, waterproof, easy setup. Perfect for weekend camping trips. Includes stakes and carry bag.',
    price: 300,
    transactionType: 'rent',
    category: 'Sports',
    condition: 'good',
    location: { city: 'Gandhinagar', address: 'Sector 9' },
    images: ['/images/products/camping-tent.jpg'],
    ownerEmail: 'rahul@example.com',
  },
  {
    title: 'Air Purifier',
    description: 'Philips AC1215 air purifier, covers up to 49 sq.m. Includes HEPA filter. Working perfectly, just upgraded to a larger model.',
    price: 4000,
    transactionType: 'sell',
    category: 'Electronics',
    condition: 'good',
    location: { city: 'Ahmedabad', address: 'Maninagar' },
    images: ['/images/products/air-purifier.jpg'],
    ownerEmail: 'user@sharecircle.com',
  },
  {
    title: 'Kitchen Mixer',
    description: 'Bosch kitchen stand mixer, 800W, 5L bowl. All attachments included. Selling because we received a new one as a gift.',
    price: 6000,
    transactionType: 'sell',
    category: 'Kitchen',
    condition: 'like_new',
    location: { city: 'Vadodara', address: 'Karelibaug' },
    images: ['/images/products/kitchen-mixer.jpg'],
    ownerEmail: 'dev@example.com',
  },
  {
    title: 'Baby Stroller',
    description: 'Chicco Bravo stroller, suitable for newborns to 3 years. Folds compactly. Neutral color, great condition with all accessories.',
    price: 0,
    transactionType: 'donate',
    category: 'Toys',
    condition: 'good',
    location: { city: 'Ahmedabad', address: 'Thaltej' },
    images: ['/images/products/baby-stroller.jpg'],
    ownerEmail: 'priya@example.com',
  },
  {
    title: 'Acoustic Guitar',
    description: 'Yamaha F310 acoustic guitar with soft case and extra strings. Perfect for beginners or intermediate players looking to borrow and practice.',
    price: 150,
    transactionType: 'borrow',
    category: 'Other',
    condition: 'good',
    location: { city: 'Ahmedabad', address: 'Vastrapur' },
    images: ['/images/products/acoustic-guitar.jpg'],
    ownerEmail: 'arjun@example.com',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.name} (${user.email}) [${user.role}]`);
    }

    // Create items
    for (const itemData of seedItems) {
      const owner = createdUsers.find((u) => u.email === itemData.ownerEmail);
      if (!owner) {
        console.log(`⚠️  Owner not found for: ${itemData.title}`);
        continue;
      }

      const { ownerEmail, ...rest } = itemData;
      await Item.create({ ...rest, owner: owner._id });
      console.log(`📦 Created item: ${itemData.title}`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('   Admin: admin@sharecircle.com / admin123');
    console.log('   User:  user@sharecircle.com / demo123');
    console.log('   All other users: demo123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
