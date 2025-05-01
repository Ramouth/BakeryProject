import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Auto-login with mock admin user on mount
  useEffect(() => {
    const autoLoginMockUser = () => {
      try {
        // Create mock admin user
        const mockAdminUser = {
          id: 'admin1',
          username: 'admin',
          email: 'admin@crumbcompass.com',
          isAdmin: true,
          profilePicture: 1
        };
        
        // Set user in state and storage
        setUser(mockAdminUser);
        console.log('Auto-logged in with mock admin user');
      } catch (error) {
        console.error('Error setting up mock user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check if already logged in first
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
          setIsLoading(false);
        } else {
          // No user in storage, create mock user
          autoLoginMockUser();
        }
      } catch (error) {
        console.error('Error retrieving user from storage:', error);
        // If there's an error reading storage, create mock user
        autoLoginMockUser();
      }
    };
    
    getUserFromStorage();
  }, []);
  
  // Login function with improved admin status handling
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Always return the mock admin user regardless of credentials
      const mockAdminUser = {
        id: 'admin1',
        username: 'admin',
        email: 'admin@crumbcompass.com',
        isAdmin: true,
        profilePicture: 1
      };
      
      setUser(mockAdminUser);
      console.log('Logged in with mock admin user');
      return mockAdminUser;
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
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
      // Always return a mock user for testing
      const mockUser = {
        ...userData,
        id: 'user1',
        isAdmin: false
      };
      
      setUser(mockUser);
      return mockUser;
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