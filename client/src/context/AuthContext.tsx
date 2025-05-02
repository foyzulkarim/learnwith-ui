import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the type for user data
export interface User {
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'github';
}

// Define the shape of the auth context
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (provider: 'google' | 'github') => Promise<void>;
  register: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Mock user data for demonstration
const mockUsers = {
  google: {
    name: 'Google User',
    email: 'user@gmail.com',
    avatar: 'https://i.pravatar.cc/150?u=google',
    provider: 'google' as const,
  },
  github: {
    name: 'GitHub User',
    email: 'user@github.com',
    avatar: 'https://i.pravatar.cc/150?u=github',
    provider: 'github' as const,
  },
};

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Login function
  const login = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set mock user data based on provider
      const userData = mockUsers[provider];
      
      // Save to local storage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoggedIn(true);
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function (similar to login for this demo)
  const register = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set mock user data based on provider
      const userData = mockUsers[provider];
      
      // Save to local storage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoggedIn(true);
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
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
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}