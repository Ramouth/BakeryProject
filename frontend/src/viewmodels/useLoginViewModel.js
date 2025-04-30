import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';

export const useLoginViewModel = () => {
  const { login, isLoading, error, currentUser } = useUser();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('admin@crumbcompass.com');
  const [password, setPassword] = useState('admin123');
  
  useEffect(() => {
    if (currentUser && currentUser.isAdmin) {
      navigate('/admin-dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = await login(email, password);
      
      if (user && user.isAdmin) {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };
  
  const handleMockLogin = async () => {
    try {
      const user = await login('admin@crumbcompass.com', 'admin123');
      if (user && user.isAdmin) {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      console.error('Mock login error:', err);
    }
  };
  
  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    handleMockLogin
  };
};