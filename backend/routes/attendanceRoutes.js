const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Mock data initialization for testing if DB is empty
const initializeMockData = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    const mockStudents = [
      { name: 'John Doe', role: 'student', email: 'john@example.com', password: 'password123' },
      { name: 'Jane Smith', role: 'student', email: 'jane@example.com', password: 'password123' },
      { name: 'Mike Ross', role: 'student', email: 'mike@example.com', password: 'password123' }
    ];
    await User.insertMany(mockStudents);
    console.log('Mock students initialized');
  }
};
initializeMockData();

// Endpoint to handle attendance marking via face recognition
router.post('/mark', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Strip base64 header
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    const tempImgPath = path.join(__dirname, '..', 'temp_face.jpg');
    
    // Save image temporarily
    fs.writeFileSync(tempImgPath, base64Data, 'base64');

    // Call Python script
    const pythonProcess = spawn('python', [path.join(__dirname, '..', 'face_recog.py'), tempImgPath]);
    
    let pythonOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      // Clean up temp image
      if (fs.existsSync(tempImgPath)) {
        fs.unlinkSync(tempImgPath);
      }

      if (code !== 0) {
        return res.status(500).json({ message: 'Face recognition failed' });
      }

      const result = pythonOutput.trim();
      console.log('Python script returned:', result);
      
      // Expected result from Python: 'UNKNOWN' or a student's ID (filename)
      if (result === 'UNKNOWN' || !result) {
        return res.status(404).json({ message: 'Face not recognized. Please try again or register.' });
      }

      const student = await User.findById(result);
      
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
        status: 'present'
      });

      await newAttendance.save();
      return res.status(200).json({ message: 'Attendance marked successfully', studentName: student.name });
    });

  } catch (error) {
    console.error('Error in mark attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint for Teacher Analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const presentToday = await Attendance.countDocuments({ 
      date: { $gte: today },
      status: 'present'
    });

    // Mock defaulters for now
    const defaulters = [
      { id: 101, name: 'Alex Johnson', percentage: 65, lastAttended: '2026-05-10' },
      { id: 102, name: 'Emily Davis', percentage: 70, lastAttended: '2026-05-12' },
      { id: 103, name: 'Chris Wilson', percentage: 60, lastAttended: '2026-05-08' }
    ];

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
    const { name, email, password, rollId, department, year, image } = req.body;
    
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
      year
    });

    await newStudent.save();

    // Save the base64 image to backend/faces directory using the user ID
    if (image) {
      const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
      const imagePath = path.join(__dirname, '../faces', `${newStudent._id}.jpg`);
      fs.writeFileSync(imagePath, base64Data, 'base64');
    }

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
    
    // Get start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const result = [];

    for (const student of students) {
      const attendanceToday = await Attendance.findOne({
        student: student._id,
        date: { $gte: startOfToday }
      });

      result.push({
        id: student._id,
        initials: student.name.charAt(0).toUpperCase(),
        name: student.name,
        roll: student.rollId || 'N/A',
        dept: student.department || 'N/A',
        year: student.year || 'N/A',
        status: attendanceToday ? 'Present' : 'Absent',
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

    // Determine Defaulters (Mocking attendance < 75%)
    // Real implementation would calculate total days vs present days
    const defaultersCount = Math.floor(absent / 2); // Simple mock for now

    res.json({
      total,
      faceRegistered,
      present,
      presentRate,
      absent,
      defaulters: defaultersCount
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
