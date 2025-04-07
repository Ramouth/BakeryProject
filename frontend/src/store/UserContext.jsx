import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/api';

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user from storage on mount
  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Ensure isAdmin is explicitly set when loading from storage
          setCurrentUser({
            ...parsedUser,
            isAdmin: parsedUser.isAdmin || false
          });
        }
      } catch (error) {
        console.error('Error retrieving user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserFromStorage();
  }, []);
  
  // Login function with improved admin status handling
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const mockPassword = 'admin123';
      let user;
      let users = [];
      
      try {
        // Attempt to fetch users and find user
        const response = await apiClient.get('/users');
        users = response.users || [];
        user = users.find(user => user.email === email);
      } catch (apiError) {
        console.error('API connection error:', apiError);
        
        // Fallback to predefined admin users
        const adminUsers = [
          {
            id: 'admin1',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@crumbcompass.com',
            isAdmin: true
          },
          {
            id: 'test1',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            isAdmin: true
          }
        ];
        
        user = adminUsers.find(u => u.email === email);
      }
      
      // Validate user and password
      if (user && password === mockPassword) {
        // Explicitly ensure isAdmin is set
        const userData = {
          ...user,
          isAdmin: user.isAdmin === true // Ensure boolean value
        };
        
        setUser(userData);
        console.log('Logged in user:', userData); // Debug log
        return userData;
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', errorMessage); // Debug log
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Set user with explicit admin status handling
  const setUser = useCallback((user) => {
    // Ensure isAdmin is always a boolean
    const userWithAdminStatus = user ? {
      ...user,
      isAdmin: user.isAdmin === true
    } : null;
    
    setCurrentUser(userWithAdminStatus);
    
    if (userWithAdminStatus) {
      localStorage.setItem('currentUser', JSON.stringify(userWithAdminStatus));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, []);
  
  // Register function with API integration
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/users/create', userData);
      
      if (response && response.user) {
        // Auto-login after successful registration
        const newUser = {
          ...response.user,
          isAdmin: false // New users are not admins by default
        };
        
        setUser(newUser);
        return newUser;
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);
  
  // Log out user
  const logout = useCallback(() => {
    setUser(null);
    // Clear any cached user data
    apiClient.clearCacheForUrl('/users');
  }, [setUser]);
  
  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    setUser
  }), [currentUser, isLoading, error, login, register, logout, setUser]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};