const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Helper to generate token
const generateToken = (user, role) => {
  return jwt.sign({ id: user._id, role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
};

// ==========================================
// STUDENT AUTHENTICATION
// ==========================================

// Student Signup
router.post('/student/signup', async (req, res) => {
  try {
    const { name, collegeId, email, password, department, semester, section, face_descriptor, face_image_url } = req.body;
    
    // Check if student exists by email or collegeId
    const existingEmail = await Student.findOne({ email });
    const existingCollegeId = await Student.findOne({ collegeId });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered.' });
    if (existingCollegeId) return res.status(400).json({ message: 'College ID already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new Student({
      name,
      collegeId,
      email,
      password: hashedPassword,
      department,
      semester,
      section,
      role: 'student',
      face_descriptor,
      face_image_url,
      is_registered: !!face_descriptor
    });

    await newStudent.save();
    
    const token = generateToken(newStudent, 'student');
    res.status(201).json({ message: 'Student registered successfully', token, user: { id: newStudent._id, name: newStudent.name, role: 'student', email: newStudent.email } });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Student Login
router.post('/student/login', async (req, res) => {
  try {
    const { collegeId, password } = req.body;
    
    const student = await Student.findOne({ collegeId });
    if (!student) return res.status(400).json({ message: 'Invalid College ID or password.' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid College ID or password.' });

    const token = generateToken(student, 'student');
    res.status(200).json({ message: 'Login successful', token, user: { id: student._id, name: student.name, role: 'student', email: student.email } });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ==========================================
// TEACHER AUTHENTICATION
// ==========================================

// Teacher Login
router.post('/teacher/login', async (req, res) => {
  try {
    const { teacherId, password } = req.body;
    
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) return res.status(400).json({ message: 'Invalid Teacher ID or password.' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Teacher ID or password.' });

    const token = generateToken(teacher, 'teacher');
    res.status(200).json({ message: 'Login successful', token, user: { id: teacher._id, name: teacher.name, role: 'teacher', email: teacher.email } });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid Email or password.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Email or password.' });

    const token = generateToken(admin, 'admin');
    res.status(200).json({ message: 'Login successful', token, user: { id: admin._id, name: admin.name, role: 'admin', email: admin.email } });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
