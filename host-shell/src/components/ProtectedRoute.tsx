// Building a protected route component that checks for authentication before rendering the desired component. If the user is not authenticated, it redirects them to the login page.

import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
    return <>{children}</>;
};

export default ProtectedRoute;