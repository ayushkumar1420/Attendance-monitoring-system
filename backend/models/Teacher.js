const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  assignedSubjects: [{ type: String }],
  assignedClasses: [{ type: String }],
  role: { type: String, default: 'teacher' }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
