import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import { useNotification } from '../store/NotificationContext';
import apiClient from '../services/api';

export const useSignUpViewModel = () => {
  const { register } = useUser();
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
      
      // If we get here, registration was successful
      showSuccess("Account created successfully!");
      navigate('/login');
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