const mongoose = require('mongoose');
const ensureDefaultAccounts = require('../scripts/seedAdmin');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected successfully');
    await ensureDefaultAccounts();
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
