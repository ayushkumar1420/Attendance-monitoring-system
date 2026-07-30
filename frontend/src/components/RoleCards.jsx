import React from 'react';
import { Link } from 'react-router-dom';
import { IoMdEye } from "react-icons/io";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { AiOutlineSetting } from "react-icons/ai";
import { FiArrowRight } from "react-icons/fi";

const RoleCards = () => {
  return (
    <div className="grid gap-lg md:grid-cols-3" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="glass-panel flex flex-col justify-between" style={{ padding: '2rem', textAlign: 'left', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(79, 70, 229, 0.1)', color: '#818cf8', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
            <IoMdEye /> <span>Mark attendance</span>
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>Student</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Use facial recognition to mark your daily attendance instantly. Check your attendance history and percentage.
          </p>
        </div>
        <Link to="/auth/student-login" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          Enter Portal <FiArrowRight /> 
        </Link> 
      </div>

      <div className="glass-panel flex flex-col justify-between" style={{ padding: '2rem', textAlign: 'left', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
            <HiOutlineOfficeBuilding /> <span>Manage class</span>
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>Teacher</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            View attendance records, register new students, manage class rosters, and track student performance.
          </p>
        </div>
        <Link to="/auth/teacher-login" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: 'var(--secondary-color)' }}>
          Enter Portal  <FiArrowRight />
        </Link> 
      </div>

      <div className="glass-panel flex flex-col justify-between" style={{ padding: '2rem', textAlign: 'left', transition: 'transform 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
            <AiOutlineSetting /> <span>Full system control</span>
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>Admin</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Manage all students, teachers, departments. View analytics, control access, and monitor the entire system.
          </p>
        </div>
        <Link to="/auth/admin-login" className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          Enter Portal   <FiArrowRight /> 
        </Link>
      </div>
    </div>
  )
}

export default RoleCards;
