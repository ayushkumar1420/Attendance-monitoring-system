const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Endpoint to handle attendance marking via face recognition
router.post('/mark', async (req, res) => {
  try {
    const { studentId, confidence, method } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'No student ID provided' });
    }

    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student recognized but not found in DB.' });
    }

    // Record attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already marked today
    const existingAttendance = await Attendance.findOne({
      student: student._id,
      date: { $gte: today }
    });

    if (existingAttendance) {
      return res.status(200).json({ message: 'Attendance already marked today', studentName: student.name });
    }

    const newAttendance = new Attendance({
      student: student._id,
      student_name: student.name,
      roll_id: student.rollId,
      department: student.department,
      status: 'present',
      confidence: confidence || 1,
      method: method || 'face_recognition'
    });

    await newAttendance.save();
    return res.status(200).json({ message: 'Attendance marked successfully', studentName: student.name });

  } catch (error) {
    console.error('Error in mark attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate real defaulters (Attendance < 75%)
const getDefaulters = async (students) => {
  // To calculate a true percentage, we need to know "Total Working Days".
  // For this demo, let's dynamically determine total working days 
  // as the number of unique days *any* attendance was marked.
  const uniqueDates = await Attendance.distinct('date');
  const totalDays = uniqueDates.length || 1; // avoid division by 0
  
  const defaultersList = [];

  for (const student of students) {
    const presentDays = await Attendance.countDocuments({ student: student._id });
    const percentage = Math.round((presentDays / totalDays) * 100);

    if (percentage < 75) {
      defaultersList.push({
        id: student._id,
        initials: student.name.charAt(0).toUpperCase(),
        name: student.name,
        dept: student.department || 'N/A',
        presentDays,
        totalDays,
        percentage
      });
    }
  }
  return defaultersList;
};

// Endpoint for Teacher Analytics
router.get('/analytics', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    const totalStudents = students.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const presentToday = await Attendance.countDocuments({ 
      date: { $gte: today },
      status: 'present'
    });

    const defaulters = await getDefaulters(students);

    res.json({
      analytics: {
        totalStudents,
        presentToday,
        defaultersCount: defaulters.length
      },
      defaulters
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint for Registering a Teacher
router.post('/register-teacher', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newTeacher = new User({
      name,
      email,
      password, // In a real app, hash the password
      role: 'teacher'
    });

    await newTeacher.save();
    res.status(201).json({ message: 'Teacher registered successfully', teacher: newTeacher });
  } catch (error) {
    console.error('Register teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint for Registering a Student
router.post('/register-student', async (req, res) => {
  try {
    const { name, email, password, rollId, department, year, face_descriptor, face_image_url } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newStudent = new User({
      name,
      email,
      password, // In a real app, hash the password
      role: 'student',
      rollId,
      department,
      year,
      face_descriptor,
      face_image_url,
      is_registered: true
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student registered successfully', student: newStudent });
  } catch (error) {
    console.error('Register student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint for Teacher Dashboard
router.get('/teacher-dashboard', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    
    // Parse the date from query params or default to today
    let startOfDay, endOfDay;
    if (req.query.date) {
      startOfDay = new Date(req.query.date);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(req.query.date);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

    const result = [];

    for (const student of students) {
      const attendanceForDate = await Attendance.findOne({
        student: student._id,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      result.push({
        id: student._id,
        initials: student.name.charAt(0).toUpperCase(),
        name: student.name,
        roll: student.rollId || 'N/A',
        dept: student.department || 'N/A',
        year: student.year || 'N/A',
        status: attendanceForDate ? 'Present' : 'Absent',
        color: '#06b6d4'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint for Admin Dashboard
router.get('/admin-dashboard', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    const total = students.length;
    
    // Get start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const attendancesToday = await Attendance.find({ date: { $gte: startOfToday } });
    
    // Unique students present today
    const presentStudentIds = new Set(attendancesToday.map(a => a.student.toString()));
    const present = presentStudentIds.size;
    const absent = total - present;
    const presentRate = total === 0 ? 0 : Math.round((present / total) * 100);

    // Get number of students with registered faces
    const facesDir = path.join(__dirname, '../faces');
    let faceRegistered = 0;
    if (fs.existsSync(facesDir)) {
      const files = fs.readdirSync(facesDir);
      faceRegistered = files.filter(f => f.endsWith('.jpg')).length;
    }

    // Determine Defaulters (Attendance < 75%)
    const defaultersList = await getDefaulters(students);

    res.json({
      total,
      faceRegistered,
      present,
      presentRate,
      absent,
      defaultersCount: defaultersList.length,
      defaultersList
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get all registered students
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, '-password');
    res.json(students);
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get all attendance records
router.get('/records', async (req, res) => {
  try {
    // Populate the student details so the frontend can display names
    const records = await Attendance.find().populate('student', 'name rollId department').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error('Fetch records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get all registered teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }, '-password');
    res.json(teachers);
  } catch (error) {
    console.error('Fetch teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to delete a user (student or teacher) and their attendance
router.delete('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated attendance records if it's a student
    if (user.role === 'student') {
      await Attendance.deleteMany({ student: userId });
    }

    await User.findByIdAndDelete(userId);
    
    res.json({ message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} deleted successfully` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
