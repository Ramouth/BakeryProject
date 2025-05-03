import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';

export const useLoginViewModel = () => {
  const { currentUser, isLoading, error, login } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (currentUser?.isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const user = await login(email, password);
        if (user?.isAdmin) {
          navigate('/admin', { replace: true });
        } else if (user) {
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Login failed:', err.message);
      }
    },
    [login, email, password, navigate]
  );

  const handleMockLogin = useCallback(async () => {
    try {
      const user = await login('admin@crumbcompass.com', 'admin123');
      if (user?.isAdmin) {
        navigate('/admin', { replace: true });
      } else if (user) {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Mock login failed:', err.message);
    }
  }, [login, navigate]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    handleMockLogin,
  };
};
