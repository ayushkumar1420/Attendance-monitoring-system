import React from 'react';
import AuthForm from '../../components/AuthForm';

const AdminLogin = () => {
  return (
    <AuthForm 
      title="Admin Login"
      role="admin"
      idField="email"
      idLabel="Admin Email"
      loginEndpoint="/api/auth/admin/login"
    />
  );
};

export default AdminLogin;
