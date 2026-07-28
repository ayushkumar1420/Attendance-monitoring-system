const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  collegeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  semester: { type: String },
  section: { type: String },
  attendancePercentage: { type: Number, default: 0 },
  role: { type: String, default: 'student' },
  // Keeping existing face recognition fields for compatibility
  face_descriptor: { type: [Number] },
  face_image_url: { type: String },
  is_registered: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
