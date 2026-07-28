const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Attendance = require('../models/Attendance');

// ==========================================
// STUDENT DASHBOARD
// ==========================================
router.get('/student', verifyJWT, authorizeRoles('student'), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Calculate total attendance percentage
    const uniqueDates = await Attendance.distinct('date');
    const totalDays = uniqueDates.length || 1;
    const presentDays = await Attendance.countDocuments({ student: student._id, status: 'present' });
    const attendancePercentage = Math.round((presentDays / totalDays) * 100);

    // Today's status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.findOne({
      student: student._id,
      date: { $gte: today }
    });

    // History
    const history = await Attendance.find({ student: student._id }).sort({ date: -1 }).limit(10);

    res.json({
      student,
      attendancePercentage,
      todayStatus: todayAttendance ? todayAttendance.status : 'Not marked',
      history,
      upcomingClasses: [] // Placeholder
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// TEACHER DASHBOARD
// ==========================================
router.get('/teacher', verifyJWT, authorizeRoles('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select('-password');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Retrieve attendance for today (overall for now, can be filtered by assigned classes later)
    const attendancesToday = await Attendance.find({ date: { $gte: today } }).populate('student', 'name collegeId department');
    const presentToday = attendancesToday.length;

    // Get defaulters among students
    const students = await Student.find();
    const uniqueDates = await Attendance.distinct('date');
    const totalDays = uniqueDates.length || 1;

    const defaulters = [];
    for (const st of students) {
      const presentCount = await Attendance.countDocuments({ student: st._id, status: 'present' });
      const percentage = Math.round((presentCount / totalDays) * 100);
      if (percentage < 75) {
        defaulters.push({
          id: st._id,
          name: st.name,
          collegeId: st.collegeId,
          percentage
        });
      }
    }

    res.json({
      teacher,
      totalAssignedClasses: teacher.assignedClasses.length,
      todayClasses: 2, // Placeholder
      presentToday,
      absentToday: students.length - presentToday,
      defaulters,
      recentSessions: attendancesToday.slice(0, 5)
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// ADMIN DASHBOARD
// ==========================================
router.get('/admin', verifyJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();

    // Departments
    const studentDepts = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const teacherDepts = await Teacher.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    const departments = new Set([...studentDepts.map(d => d._id), ...teacherDepts.map(d => d._id)]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentToday = await Attendance.countDocuments({ date: { $gte: today }, status: 'present' });

    res.json({
      systemStats: {
        totalStudents,
        totalTeachers,
        totalDepartments: departments.size,
        totalClasses: 10 // Placeholder
      },
      todayStats: {
        studentsPresent: presentToday,
        studentsAbsent: totalStudents - presentToday,
        teachersAvailable: totalTeachers, // Placeholder
        teachersOnLeave: 0 // Placeholder
      },
      departmentOverview: {
        students: studentDepts,
        teachers: teacherDepts
      },
      recentActivity: [] // Placeholder
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
