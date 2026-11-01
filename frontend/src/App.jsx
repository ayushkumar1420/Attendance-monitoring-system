import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/home";
import StudentPortal from "./pages/StudentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import AdminPortal from "./pages/AdminPortal";
import Registration from "./pages/Registration";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLogin from "./pages/auth/StudentLogin";
import StudentSignup from "./pages/auth/StudentSignup";
import TeacherLogin from "./pages/auth/TeacherLogin";
import AdminLogin from "./pages/auth/AdminLogin";

// Redirect logged-in users away from auth/home pages to their dashboard
const GuestRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={
              <GuestRoute>
                <Home />
              </GuestRoute>
            } />

            {/* Auth Routes — redirect to dashboard if already logged in */}
            <Route path="/auth/student-login" element={
              <GuestRoute><StudentLogin /></GuestRoute>
            } />
            <Route path="/auth/student-signup" element={
              <GuestRoute><StudentSignup /></GuestRoute>
            } />
            <Route path="/auth/teacher-login" element={
              <GuestRoute><TeacherLogin /></GuestRoute>
            } />
            <Route path="/auth/admin-login" element={
              <GuestRoute><AdminLogin /></GuestRoute>
            } />

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
