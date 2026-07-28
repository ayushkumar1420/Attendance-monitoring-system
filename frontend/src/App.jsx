import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/home";
import StudentPortal from "./pages/StudentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import AdminPortal from "./pages/AdminPortal";
import Registration from "./pages/Registration";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import StudentLogin from "./pages/auth/StudentLogin";
import StudentSignup from "./pages/auth/StudentSignup";
import TeacherLogin from "./pages/auth/TeacherLogin";
import AdminLogin from "./pages/auth/AdminLogin";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Auth Routes */}
            <Route path="/auth/student-login" element={<StudentLogin />} />
            <Route path="/auth/student-signup" element={<StudentSignup />} />
            <Route path="/auth/teacher-login" element={<TeacherLogin />} />
            <Route path="/auth/admin-login" element={<AdminLogin />} />

            {/* Protected Dashboard Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPortal />
              </ProtectedRoute>
            } />
            
            <Route path="/teacher" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherPortal />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            } />
            
            <Route path="/registration" element={<Registration />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;