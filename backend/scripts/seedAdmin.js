const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: 'admin@system.com' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@system.com',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin seeded successfully: email: admin@system.com, password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedAdmin();
