import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useUser } from '../auth.hooks';
import { QueryWrapper } from '@/components/query/QueryWrapper';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  fallbackPath = '/login',
}) => {
  const {
    data: { isAuthenticated },
    isLoading,
  } = useUser();
  // console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <QueryWrapper>
      {!isAuthenticated && requireAuth ? (
        <Navigate to={fallbackPath} replace={true} />
      ) : (
        children || <Outlet />
      )}
    </QueryWrapper>
  );
};
