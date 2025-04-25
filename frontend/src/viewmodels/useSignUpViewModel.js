import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import { useNotification } from '../store/NotificationContext';

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
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      showSuccess("Account created successfully!");
      navigate('/login');
    } catch (err) {
      showError(err.message || "Failed to create account");
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