const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student_name: { type: String },
  roll_id: { type: String },
  department: { type: String },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
  markedAt: { type: Date, default: Date.now },
  confidence: { type: Number },
  method: { type: String, enum: ['face_recognition', 'manual'], default: 'face_recognition' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
