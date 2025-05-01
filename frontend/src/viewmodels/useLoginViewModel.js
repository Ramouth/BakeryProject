// Updated useLoginViewModel.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
// apiClient is not needed directly here anymore, as the Context handles API calls

export const useLoginViewModel = () => {
  // Get the login function from the context, along with state/setters
  const { currentUser, isLoading, error, login, setIsLoading, setError } = useUser();
  const navigate = useNavigate();

  // Change state variable name for clarity if backend expects 'username'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (currentUser?.isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, navigate]);


  // Handler for your form submit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      // Use the login function from the context
      try {
        const user = await login(username, password); // Use the login function from the context
        if (user?.isAdmin) { // Add null check for user
          navigate('/admin', { replace: true });
        } else if (user) { // Optionally navigate non-admins somewhere else
           navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Login failed:', err.message);
        // The error is already set in the context by the login function there
      }
    },
    [login, username, password, navigate] // Depend on the context's login function
  );

  const handleMockLogin = useCallback(async () => {
     // Use the login function from the context with desired mock credentials
     try {
         const user = await login('admin@crumbcompass.com', 'admin123'); // Using the context's login
         if (user?.isAdmin) {
             navigate('/admin', { replace: true });
         } else if (user) {
            navigate('/', { replace: true });
         }
     } catch (err) {
         console.error('Mock login failed:', err.message);
         // Error already set in context
     }
  }, [login, navigate]); // Depend on the context's login function

  return {
    username, // Expose username state
    setUsername, // Expose setUsername setter
    password,
    setPassword,
    isLoading, // Provided by context
    error, // Provided by context
    handleSubmit,
    handleMockLogin,
  };
};