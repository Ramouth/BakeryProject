import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/api'; // Make sure this import path is correct

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Attempt to load user from token on mount
  useEffect(() => {
    // FIXED: Changed key from 'accessToken' to 'access_token' to match backend
    const token = localStorage.getItem('access_token');
    if (token) {
      // Try to fetch the user profile using the token
      console.log('Found token in storage, attempting to fetch user profile');
      apiClient.get('/auth/profile')
        .then(response => {
          console.log('Profile fetch successful:', response);
          setCurrentUser(response);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Profile fetch failed:', err);
          // FIXED: Use consistent token key
          localStorage.removeItem('access_token');
          setCurrentUser(null);
          setIsLoading(false);
        });
    } else {
      console.log('No access token found in storage');
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting login for user:', username);
      // Using API client's post method
      const response = await apiClient.post('/auth/login', { username, password });
      
      // FIXED: Better response handling based on Flask backend format
      // The Flask backend returns: { message, user, access_token }
      const { access_token, user } = response;
      
      console.log('Login successful, received token:', !!access_token);
      
      // FIXED: Store with consistent key name
      localStorage.setItem('access_token', access_token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.';
      setError(msg);
      console.error('Login error:', err);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting to register user:', userData.username);
      const response = await apiClient.post('/auth/register', userData);
      
      // FIXED: Better response handling
      const { access_token, user } = response;
      
      console.log('Registration successful, received token:', !!access_token);
      
      // FIXED: Store with consistent key name
      localStorage.setItem('access_token', access_token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      console.error('Registration error:', err);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out user, removing access token');
    // FIXED: Use consistent token key
    localStorage.removeItem('access_token');
    setCurrentUser(null);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    setUser: setCurrentUser
  }), [currentUser, isLoading, error, login, register, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};