import React from 'react';
import AuthForm from '../../components/AuthForm';

const TeacherLogin = () => {
  return (
    <AuthForm 
      title="Teacher Login"
      role="teacher"
      idField="teacherId"
      idLabel="Teacher ID"
      loginEndpoint="/api/auth/teacher/login"
    />
  );
};

export default TeacherLogin;
