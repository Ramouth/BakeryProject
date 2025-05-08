import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/api';
import { User } from '../models/User';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('Found token in storage, attempting to fetch user profile');
      apiClient.get('/auth/profile')
        .then(response => {
          console.log('Profile fetch successful:', response);
          setCurrentUser(User.fromApiResponse(response));
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Profile fetch failed:', err);
          localStorage.removeItem('access_token');
          setCurrentUser(null);
          setIsLoading(false);
        });
    } else {
      console.log('No access token found in storage');
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting login for user:', email);

      // Create a payload that matches the backend's expected format
      // The backend expects 'username' not 'email'
      const payload = {
        username: email, // Use email as username since Login.jsx collects email
        password: password
      };
      
      console.log('Sending login payload:', payload);
      const response = await apiClient.post('/auth/login', payload);

      const { access_token, user } = response;

      console.log('Login successful, received token:', !!access_token);
      localStorage.setItem('access_token', access_token);
      setCurrentUser(User.fromApiResponse(user));
      return User.fromApiResponse(user);
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
  
      // Use apiClient directly without creating a new User instance
      const response = await apiClient.post('/auth/register', userData);
  
      const { access_token, user: registeredUser } = response;
  
      console.log('Registration successful, received token:', !!access_token);
      localStorage.setItem('access_token', access_token);
      setCurrentUser(User.fromApiResponse(registeredUser));
      return User.fromApiResponse(registeredUser);
    } catch (err) {
      // Enhanced error handling
      const msg = err.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
      console.error('Registration error:', err);
      
      if (err.status === 422) {
        console.error('Validation errors:', err.data);
        // If the backend returns specific validation errors
        if (err.data?.errors) {
          const errorMessages = Object.entries(err.data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
          throw new Error(errorMessages || msg);
        }
      }
      
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out user, removing access token');
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