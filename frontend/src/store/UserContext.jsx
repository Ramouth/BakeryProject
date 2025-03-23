import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/api';

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  // State for the current user
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user from storage on mount
  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error retrieving user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserFromStorage();
  }, []);
  
  // Login function with API integration
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/contacts');
      const contacts = response.contacts || [];
      
      const user = contacts.find(contact => contact.email === email);
      
      if (user) {
        // Set isAdmin based on database value or defaults to false
        const userData = {
          ...user,
          isAdmin: user.isAdmin || false
        };
        
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Set user and save to storage
  const setUser = useCallback((user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, []);
  
  // Register function with API integration
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/contacts/create', userData);
      
      if (response && response.contact) {
        // Auto-login after successful registration
        const newUser = {
          ...response.contact,
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
    apiClient.clearCacheForUrl('/contacts');
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