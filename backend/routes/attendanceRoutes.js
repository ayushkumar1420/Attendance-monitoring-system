const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Attendance = require('../models/Attendance');

// Endpoint to handle attendance marking via face recognition
router.post('/mark', async (req, res) => {
  try {
    const { studentId, confidence, method } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'No student ID provided' });
    }

    const student = await Student.findById(studentId);
    
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
      roll_id: student.collegeId, // Using collegeId instead of rollId
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
  const uniqueDates = await Attendance.distinct('date');
  const totalDays = uniqueDates.length || 1; 
  
  const defaultersList = [];

  for (const student of students) {
    const presentDays = await Attendance.countDocuments({ student: student._id, status: 'present' });
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
    const students = await Student.find();
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

// Endpoint to get all registered students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({}, '-password');
    res.json(students);
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get all attendance records
router.get('/records', async (req, res) => {
  try {
    const records = await Attendance.find().populate('student', 'name collegeId department').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error('Fetch records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get all registered teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find({}, '-password');
    res.json(teachers);
  } catch (error) {
    console.error('Fetch teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to delete a user (student or teacher) and their attendance
router.delete('/user/:role/:id', async (req, res) => {
  try {
    const { role, id } = req.params;
    
    if (role === 'student') {
      const student = await Student.findById(id);
      if (!student) return res.status(404).json({ message: 'Student not found' });
      await Attendance.deleteMany({ student: id });
      await Student.findByIdAndDelete(id);
      return res.json({ message: 'Student deleted successfully' });
    } else if (role === 'teacher') {
      const teacher = await Teacher.findById(id);
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
      await Teacher.findByIdAndDelete(id);
      return res.json({ message: 'Teacher deleted successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
