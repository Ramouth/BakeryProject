import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import { useNotification } from '../store/NotificationContext';
import apiClient from '../services/api';
import { User } from '../models/User';

export const useSignUpViewModel = () => {
  const { login, setUser } = useUser();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a payload with the correct structure that matches the backend expectations
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        profilePicture: 1  // Match the camelCase format expected by the schema
      };

      console.log("Register payload:", userData);
      
      // Call the backend directly using apiClient
      const response = await apiClient.post('/auth/register', userData);
      
      // If registration is successful, automatically log in the user
      if (response && response.access_token) {
        // The registration response already contains the access token and user data
        localStorage.setItem('access_token', response.access_token);
        
        // Set the user in the context
        if (response.user) {
          // Create a user object from the response and set it in the context
          const user = User.fromApiResponse(response.user);
          setUser(user);
        } else {
          // If for some reason we don't have user data in the response,
          // fetch the user profile
          try {
            const userProfile = await apiClient.get('/auth/profile');
            const user = User.fromApiResponse(userProfile);
            setUser(user);
          } catch (profileError) {
            console.error("Error fetching user profile after registration:", profileError);
          }
        }
        
        // Show success message
        showSuccess("Account created successfully!");
        
        // Navigate to the homepage
        navigate('/', { replace: true });
      } else {
        // If we don't get an access token directly from registration,
        // we need to log in manually using the credentials
        try {
          await login(formData.email, formData.password);
          showSuccess("Account created successfully!");
          navigate('/', { replace: true });
        } catch (loginError) {
          console.error("Auto-login failed after successful registration:", loginError);
          showSuccess("Account created successfully! Please log in.");
          navigate('/login');
        }
      }
    } catch (err) {
      console.error("Registration error details:", err);
      
      // Show a more specific error message if available
      if (err.data && err.data.errors) {
        // Format validation errors for display
        const errorMessages = Object.entries(err.data.errors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('; ');
        showError(errorMessages || err.message || "Failed to create account");
      } else if (err.data && err.data.message) {
        showError(err.data.message);
      } else {
        showError(err.message || "Failed to create account");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
    navigate
  };
};