const mongoose = require('mongoose');
const config = require('../config');
const { insertSampleData } = require('../utils/seedData');

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB.');
    // Force clear and re‑seed
    await insertSampleData(true);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();