const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const ensureDefaultAccounts = async () => {
  try {
    const salt = await bcrypt.genSalt(10);

    // 1. Ensure Default Admin
    const existingAdmin = await Admin.findOne({ email: 'admin@system.com' });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcrypt.hash('admin123', salt);
      const admin = new Admin({
        name: 'Super Admin',
        email: 'admin@system.com',
        password: hashedAdminPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Default admin seeded: admin@system.com / admin123');
    } else {
      console.log('Default admin verified: admin@system.com');
    }

    // 2. Ensure Default Teacher
    const existingTeacher = await Teacher.findOne({ teacherId: 'T101' });
    if (!existingTeacher) {
      const hashedTeacherPassword = await bcrypt.hash('teacher123', salt);
      const teacher = new Teacher({
        name: 'Prof. Alex Johnson',
        teacherId: 'T101',
        email: 'teacher@system.com',
        password: hashedTeacherPassword,
        department: 'CS',
        role: 'teacher'
      });
      await teacher.save();
      console.log('Default teacher seeded: T101 / teacher123');
    } else {
      console.log('Default teacher verified: T101');
    }

    // 3. Ensure Default Student
    const existingStudent = await Student.findOne({ collegeId: 'S101' });
    if (!existingStudent) {
      const hashedStudentPassword = await bcrypt.hash('student123', salt);
      const student = new Student({
        name: 'Sam Wilson',
        collegeId: 'S101',
        email: 'student@system.com',
        password: hashedStudentPassword,
        department: 'CS',
        semester: '1st',
        section: 'A',
        role: 'student'
      });
      await student.save();
      console.log('Default student seeded: S101 / student123');
    } else {
      console.log('Default student verified: S101');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

if (require.main === module) {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance';
  mongoose.connect(mongoURI)
    .then(async () => {
      console.log('MongoDB Connected');
      await ensureDefaultAccounts();
      process.exit(0);
    })
    .catch(err => {
      console.error('MongoDB Connection Error:', err);
      process.exit(1);
    });
}

module.exports = ensureDefaultAccounts;
