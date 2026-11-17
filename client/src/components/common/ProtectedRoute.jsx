/**
 * @fileoverview Route guard ensuring access only to authenticated users.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Skeleton from './Skeleton.jsx';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Skeleton height="40px" width="200px" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="150px" style={{ marginBottom: '1rem' }} />
        <Skeleton height="300px" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
