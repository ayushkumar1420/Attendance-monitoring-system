import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FiArrowLeft, FiCheckCircle, FiUsers, FiBarChart2, FiSearch, FiUserPlus, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";

const Teacher = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Attendance');
  const [loading, setLoading] = useState(true);
  
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllData = async () => {
    try {
      const [studentsRes, recordsRes, dashRes] = await Promise.all([
        api.get('/api/attendance/students'),
        api.get('/api/attendance/records'),
        api.get('/api/teacher')
      ]);
      setStudents(studentsRes.data);
      setRecords(recordsRes.data);
      setDashboardData(dashRes.data);
    } catch (error) { console.error('Failed to fetch data', error); }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/api/attendance/user/student/${id}`);
        setStudents(prev => prev.filter(s => s._id !== id));
      } catch (error) { alert(error.response?.data?.message || 'Failed to delete student'); }
    }
  };

  useEffect(() => {
    const init = async () => { setLoading(true); await fetchAllData(); setLoading(false); };
    init();
    const intervalId = setInterval(() => { fetchAllData(); }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const studentsAttendanceList = students.map(student => {
    const hasAttended = records.some(r => r.student?._id === student._id && r.date.startsWith(selectedDate));
    return {
      id: student._id, initials: student.name.charAt(0).toUpperCase(), name: student.name,
      collegeId: student.collegeId || 'N/A', dept: student.department || 'N/A', year: student.semester || 'N/A',
      status: hasAttended ? 'Present' : 'Absent', color: '#818cf8'
    };
  });

  const filteredStudents = studentsAttendanceList.filter(student => {
    return (selectedDept === 'All' || student.dept === selectedDept) &&
           (selectedYear === 'All' || student.year === selectedYear) &&
           (student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.collegeId.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const presentCount = filteredStudents.filter(s => s.status === 'Present').length;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <header className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-md">
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem' }}><FiArrowLeft size={20} /></Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HiOutlineTemplate className="text-gradient" /> Teacher Portal</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome, {user?.name}</p>
          </div>
        </div>
        <Link to="/registration" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiUserPlus /> Register Student</Link>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        {['Attendance', 'Students', 'Analytics'].map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(tab)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}>
            {tab === 'Attendance' && <FiCheckCircle />}
            {tab === 'Students' && <FiUsers />}
            {tab === 'Analytics' && <FiBarChart2 />}
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ margin: '0 auto', borderColor: 'var(--primary-color)' }}></div><p>Loading...</p></div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {activeTab === 'Attendance' && (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="flex gap-md">
                  <input type="date" className="form-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: 'auto' }} />
                  <div style={{ position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-muted)' }} />
                    <input type="text" className="form-input" placeholder="Search student..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{presentCount}</span> / {filteredStudents.length} present
                </div>
              </div>

              <div className="table-wrapper">
                <table className="styled-table">
                  <thead><tr><th>Student</th><th>College ID</th><th>Department</th><th>Semester</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (<tr><td colSpan="5" style={{ textAlign: 'center' }}>No students match the criteria.</td></tr>) : (
                      filteredStudents.map(student => (
                        <tr key={student.id}>
                          <td>
                            <div className="flex items-center gap-sm">
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: student.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{student.initials}</div>
                              <span>{student.name}</span>
                            </div>
                          </td>
                          <td>{student.collegeId}</td><td>{student.dept}</td><td>{student.year}</td>
                          <td>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: student.status === 'Present' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: student.status === 'Present' ? 'var(--success)' : 'var(--danger)' }}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'Students' && (
             <div className="table-wrapper">
               <table className="styled-table">
                 <thead><tr><th>Name</th><th>Email</th><th>College ID</th><th>Department</th><th>Semester</th><th>Actions</th></tr></thead>
                 <tbody>
                   {students.length === 0 ? (<tr><td colSpan="6" style={{ textAlign: 'center' }}>No students registered.</td></tr>) : (
                     students.map(student => (
                       <tr key={student._id}>
                         <td>{student.name}</td><td>{student.email}</td><td>{student.collegeId}</td><td>{student.department}</td><td>{student.semester}</td>
                         <td><button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteStudent(student._id)}><FiTrash2 /> Delete</button></td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          )}

          {activeTab === 'Analytics' && (
            <div>
              <h3 className="flex items-center gap-sm" style={{ marginBottom: '1.5rem', color: '#fbbf24' }}><FiAlertTriangle /> Defaulter Alert List ({dashboardData?.defaulters?.length || 0})</h3>
              {dashboardData?.defaulters?.length > 0 ? (
                <div className="grid gap-md md:grid-cols-2">
                  {dashboardData.defaulters.map(def => (
                    <div key={def.id} className="flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                       <div><h4 style={{ margin: 0 }}>{def.name}</h4><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {def.collegeId}</p></div>
                       <div style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{def.percentage}%</div>
                    </div>
                  ))}
                </div>
              ) : (<p>No defaulters found.</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Teacher;
