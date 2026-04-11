require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Item = require('./server/models/Item');
const User = require('./server/models/User');

const categories = [
  'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports',
  'Garden', 'Kitchen', 'Tools', 'Toys', 'Vehicles', 'Other',
];

const transactionTypes = ['buy', 'sell', 'rent', 'borrow', 'share', 'exchange', 'donate'];
const conditions = ['new', 'like_new', 'good', 'fair', 'poor'];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Find users
    const users = await User.find({ name: /chetsha|mahesh|shilpa/i });
    if (users.length === 0) {
        console.log('Could not find users matching chetsha, mahesh, shilpa. Fetching any 3 users.');
        const allUsers = await User.find().limit(3);
        if (allUsers.length > 0) users.push(...allUsers);
        else throw new Error('No users found in database');
    }
    
    console.log(`Found ${users.length} users to use as owners.`);

    const newItems = [];

    const categoryImages = {
      Electronics: ['/images/products/macbook-pro.jpg', '/images/products/air-purifier.jpg'],
      Furniture: ['/images/products/standing-desk.jpg'],
      Clothing: ['/images/products/yoga-mat.jpg'],
      Books: ['/images/products/fiction-books.jpg', '/images/products/harry-potter-books.jpg'],
      Sports: ['/images/products/mountain-bicycle.jpg', '/images/products/camping-tent.jpg', '/images/products/yoga-mat.jpg'],
      Garden: ['/images/products/garden-tools.jpg'],
      Kitchen: ['/images/products/kitchen-mixer.jpg'],
      Tools: ['/images/products/power-drill.jpg', '/images/products/garden-tools.jpg'],
      Toys: ['/images/products/kids-toys.jpg', '/images/products/baby-stroller.jpg'],
      Vehicles: ['/images/products/mountain-bicycle.jpg'],
      Other: ['/images/products/acoustic-guitar.jpg']
    };

    categories.forEach((category) => {
      transactionTypes.forEach((type, index) => {
        for (let i = 0; i < 7; i++) {
          // Pick a user in round-robin fashion, considering the 7 items too
          const owner = users[(index + i) % users.length];
          const condition = conditions[(index + i) % conditions.length];

          let price = 0, mrp = 0, deposit = 0, rentPerDay = 0, borrowPerDay = 0, sharePerDay = 0;
          
          // Generate sensible prices
          mrp = Math.floor(Math.random() * 5000) + 500;
          
          if (type === 'sell' || type === 'buy') {
              price = Math.floor(mrp * 0.7);
          } else if (type === 'rent') {
              rentPerDay = Math.floor(mrp * 0.05);
              deposit = Math.floor(mrp * 0.5);
          } else if (type === 'borrow') {
              borrowPerDay = Math.floor(mrp * 0.02);
              deposit = Math.floor(mrp * 0.5);
          } else if (type === 'share') {
              sharePerDay = 0;
              deposit = Math.floor(mrp * 0.3);
          } else if (type === 'exchange') {
              price = 0;
          } else if (type === 'donate') {
              price = 0;
          }

          const catImages = categoryImages[category] || categoryImages['Other'];
          const selectedImage = catImages[i % catImages.length];

          const item = {
            title: `${category} item for ${type} ${i + 1}`,
            description: `This is an amazing ${category} item that is available to ${type}. It's in ${condition} condition.`,
            price,
            mrp,
            deposit,
            rentPerDay,
            borrowPerDay,
            sharePerDay,
            transactionType: type,
            category: category,
            condition: condition,
            images: [selectedImage],
            owner: owner._id,
            location: {
              city: owner.location?.city || 'Ahmedabad',
              address: owner.location?.address || 'Default Address',
              coordinates: {
                type: 'Point',
                coordinates: [72.5714, 23.0225]
              }
            },
            status: 'available',
            views: Math.floor(Math.random() * 50)
          };
          
          newItems.push(item);
        }
      });
    });

    console.log(`Inserting ${newItems.length} items...`);
    await Item.insertMany(newItems);
    console.log('Seeding successful!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
