import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Spin } from 'antd';

const ProtectedRoute: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;