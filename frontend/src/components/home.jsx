import React from 'react'
import './home.css'
import { PiStudentFill } from "react-icons/pi";
import { GiTeacher } from "react-icons/gi";
import { RiAdminFill } from "react-icons/ri";

const Home = () => {
  return (
    <div class="ctn-1">
      <div className="badge">
        <span class="icon">⚡</span>
        <span>AI-Powered Attendance System</span>
        <span class="icon">✨</span>
      </div>

      <h1 className='head'>Attendance-AI</h1>
      <p className='para'>Face Recognition · Real-time Analytics · Smart Tracking</p>
      <p className='option'>Select your role to continue</p>

      <div className='roles'>
        <div className='student'>
          <span className='st-icons'><PiStudentFill /></span>
          <h2>Student</h2>
        </div>
        <div className='teacher'>
          <span className='te-icons'><GiTeacher /></span>
          <h2>Teacher</h2>
        </div>
        <div className='admin'>
          <span className='ad-icons'><RiAdminFill /></span>
          <h2>Admin</h2>
        </div>
      </div>
      
    </div>
  )
}

export default Home
