import { ReactNode, useEffect } from 'react';
import { useLocation, Route } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { isLocalDevelopment } from '@/lib/environment';

interface ProtectedRouteProps {
  children: ReactNode;
  path: string;
}

export function ProtectedRoute({ children, path }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const isLocal = isLocalDevelopment();

  useEffect(() => {
    // Skip authentication check if running locally
    if (!isLoading && !isLoggedIn && !isLocal) {
      // Redirect to login if not authenticated and not in local development
      navigate('/login');
    }
  }, [isLoggedIn, isLoading, navigate, isLocal]);

  if (isLoading && !isLocal) {
    // Show loading indicator while checking auth status (skip in local dev)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render the route if authenticated or in local development
  return isLoggedIn || isLocal ? <Route path={path}>{children}</Route> : null;
}
