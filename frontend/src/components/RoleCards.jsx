import React from 'react';
import { Link } from 'react-router-dom';
import { IoMdEye } from "react-icons/io";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { AiOutlineSetting } from "react-icons/ai";
import { FiArrowRight } from "react-icons/fi";

const RoleCards = () => {
  return (
    <div className='roles'>
      <div className='card student-card'>
        <div className='card-pill student-pill'>
          <IoMdEye /> <span>Mark your attendance</span>
        </div>
        <h2 className='card-title'>Student</h2>
        <p className='card-desc'>
          Use facial recognition to mark your daily attendance instantly. Check your attendance history and percentage.
        </p>
        <div className='card-footer'>
          <Link to="/auth/student-login" className='student-enter-portal-btn' style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Enter Portal <FiArrowRight /> 
          </Link> 
        </div>
      </div>

      <div className='card teacher-card'>
        <div className='card-pill teacher-pill'>
          <HiOutlineOfficeBuilding /> <span>Manage your class</span>
        </div>
        <h2 className='card-title'>Teacher</h2>
        <p className='card-desc'>
          View attendance records, register new students, manage class rosters, and track student performance.
        </p>
        <div className='card-footer'>
          <Link to="/auth/teacher-login" className='teacher-enter-portal-btn' style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Enter Portal  <FiArrowRight />
          </Link> 
        </div>
      </div>

      <div className='card admin-card'>
        <div className='card-pill admin-pill'>
          <AiOutlineSetting /> <span>Full system control</span>
        </div>
        <h2 className='card-title'>Admin</h2>
        <p className='card-desc'>
          Manage all students, teachers, departments. View analytics, control access, and monitor the entire system.
        </p>
        <div className='card-footer'>
          <Link to="/auth/admin-login" className='admin-enter-portal-btn' style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Enter Portal   <FiArrowRight /> 
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RoleCards;

