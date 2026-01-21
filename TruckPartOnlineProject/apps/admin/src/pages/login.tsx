import React from 'react';
import Login from '@/components/auth/login';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-500 to-gray-500">
      <Login />
    </div>
  );
};

export default LoginPage;
