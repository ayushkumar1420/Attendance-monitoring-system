const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const ensureDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: 'admin@system.com' });
    if (existingAdmin) {
      console.log('Default admin verified: admin@system.com');
      return existingAdmin;
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
    return admin;
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

if (require.main === module) {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance';
  mongoose.connect(mongoURI)
    .then(async () => {
      console.log('MongoDB Connected');
      await ensureDefaultAdmin();
      process.exit(0);
    })
    .catch(err => {
      console.error('MongoDB Connection Error:', err);
      process.exit(1);
    });
}

module.exports = ensureDefaultAdmin;
