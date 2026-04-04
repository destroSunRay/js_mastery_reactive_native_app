import { useUser } from '../auth.hooks';
import { Navigate, Outlet } from 'react-router';

interface PublicRouteProps {
  redirectAuthenticated?: string;
  children?: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  redirectAuthenticated = '/dashboard',
  children,
}) => {
  const {
    data: { isAuthenticated },
    isLoading,
  } = useUser();
  const location = window.location.pathname;

  // If the user is authenticated and tries to access an auth page, redirect them
  if (
    isAuthenticated &&
    ['/login', '/register', '/forgot-password'].includes(location)
  ) {
    return <Navigate to={redirectAuthenticated} replace />;
  }

  // If we're still loading the auth state, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // if (isAuthenticated) {
  //   return <Navigate to={redirectAuthenticated} replace />;
  // }

  return children ? <>{children}</> : <Outlet />;
};
