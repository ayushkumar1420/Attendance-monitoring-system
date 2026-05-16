import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/home"; // We will rename/update this
import StudentPortal from "./pages/student";
import TeacherPortal from "./pages/teacher";
import AdminPortal from "./pages/admin";
import Registration from "./pages/Registration";

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentPortal />} />
          <Route path="/teacher" element={<TeacherPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/registration" element={<Registration />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;