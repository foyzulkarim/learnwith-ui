import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useLocation } from 'wouter';
import { isLocalDevelopment } from '@/lib/environment';

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
  isLocalDev: boolean;
}

// Mock user for local development
const mockDevUser: User = {
  id: 'dev-user-123',
  name: 'Local Developer',
  email: 'dev@localhost',
  role: 'admin',
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  login: () => {},
  register: () => {},
  logout: async () => {},
  isLocalDev: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const isLocalDev = isLocalDevelopment();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isLocalDev);
  const [user, setUser] = useState<User | null>(isLocalDev ? mockDevUser : null);
  const [isLoading, setIsLoading] = useState<boolean>(!isLocalDev); // Don't show loading if in local dev
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
    // Skip auth check if in local development
    if (isLocalDev) return;
    
    const checkAuthStatus = async () => {
      try {
        const response = await api.getUser();
        if (response) {
          setUser(response as User); // Cast the response to User type
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.log('Not authenticated');
        // User is not authenticated - this is not an error
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [isLocalDev]);

  // Login function - redirects to OAuth provider
  const login = (provider: 'google') => {
    // If in local dev, simulate successful login
    if (isLocalDev) {
      setUser(mockDevUser);
      setIsLoggedIn(true);
      navigate('/dashboard');
      return;
    }
    
    setError(null);
    
    // Redirect to Google OAuth endpoint
    if (provider === 'google') {
      window.location.href = api.getGoogleAuthUrl();
    }
  };

  // Register function - same as login for OAuth providers
  const register = (provider: 'google') => {
    login(provider);
  };

  // Logout function
  const logout = async () => {
    // If in local dev, simulate logout
    if (isLocalDev) {
      // We don't actually log out in dev mode
      // Just simulate navigation
      navigate('/');
      return Promise.resolve();
    }
    
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      setIsLoggedIn(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context to children components
  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        user, 
        isLoading, 
        error, 
        login, 
        register, 
        logout,
        isLocalDev
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
