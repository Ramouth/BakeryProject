// Updated UserContext.js (Conceptual)
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/apiClient'; // Your axios/fetch wrapper

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Attempt to load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Set Authorization header for future requests
      // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Or handle this in apiClient wrapper

      // Try to fetch the user profile using the token
      apiClient.get('/auth/profile')
        .then(response => {
          // Assuming /auth/profile returns the user object
          setCurrentUser(response.data);
          setIsLoading(false);
        })
        .catch(() => {
          // Token invalid or profile fetch failed, clear token and user
          localStorage.removeItem('authToken');
          setCurrentUser(null);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { access_token, user } = response.data;

      localStorage.setItem('authToken', access_token);
      // apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`; // Or handle in apiClient wrapper
      setCurrentUser(user);
      return user; // Return the user object
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(msg);
      console.error('Login error:', err);
      throw new Error(msg); // Rethrow the error so calling component can handle it
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencies might be needed if apiClient isn't static

  // Modify register to use API call too
  const register = useCallback(async (userData) => {
       setIsLoading(true);
       setError(null);
       try {
           // Make the actual API call to your backend's register endpoint
           const response = await apiClient.post('/auth/register', userData);
           const { access_token, user } = response.data; // Assuming register also returns token and user

           localStorage.setItem('authToken', access_token);
           // apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`; // Or handle in apiClient wrapper
           setCurrentUser(user);
           return user;
       } catch (err) {
           const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
           setError(msg);
           console.error('Registration error:', err);
           throw new Error(msg);
       } finally {
           setIsLoading(false);
       }
   }, []);


  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    // Remove Authorization header
    // delete apiClient.defaults.headers.common['Authorization']; // Or handle in apiClient wrapper
    setCurrentUser(null);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    isLoading,
    error,
    login, // <-- Now this is the real API login
    register, // <-- Now this is the real API register
    logout,
    setUser: setCurrentUser // Expose the raw setter if needed, though often discouraged
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