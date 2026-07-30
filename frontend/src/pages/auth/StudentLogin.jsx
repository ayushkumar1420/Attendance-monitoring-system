import React from 'react';
import AuthForm from '../../components/AuthForm';

const StudentLogin = () => {
  return (
    <AuthForm 
      title="Student Login"
      role="student"
      idField="collegeId"
      idLabel="College ID"
      loginEndpoint="/api/auth/student/login"
      signupLink="/auth/student-signup"
    />
  );
};

export default StudentLogin;
