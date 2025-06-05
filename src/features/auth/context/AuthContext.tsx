import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import { useLocation } from 'wouter';

// Define the type for user data
export interface User {
  id: string;
  name: string | null;
  email: string;
  avatar?: string;
  role?: string; // Added role field with optional marker for role-based access control
}

// Define the shape of the auth context
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (provider: 'google') => void;
  register: (provider: 'google') => void;
  logout: () => Promise<void>;
}


// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  login: () => { },
  register: () => { },
  logout: async () => { }
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Check if the URL has error parameters (from OAuth callback)
  useEffect(() => {
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (errorParam) {
      setError(errorDescription || 'Authentication failed');
      // Remove the error params from URL to avoid showing the error on page refresh
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  // Check auth status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.getUser();
        if (response) {
          setUser(response as User); // Cast the response to User type
          setIsLoggedIn(true);
        }
      } catch (err) {
        // User is not authenticated - this is not an error
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function - redirects to OAuth provider
  const login = useCallback((provider: 'google') => {
    setError(null);

    // Redirect to Google OAuth endpoint
    if (provider === 'google') {
      window.location.href = api.getGoogleAuthUrl();
    }
  }, []);

  // Register function - same as login for OAuth providers
  const register = useCallback((provider: 'google') => {
    login(provider);
  }, [login]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      setIsLoggedIn(false);
      navigate('/');
    } catch (err) {
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isLoggedIn,
    user,
    isLoading,
    error,
    login,
    register,
    logout
  }), [isLoggedIn, user, isLoading, error, login, register, logout]);

  // Provide the auth context to children components
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
