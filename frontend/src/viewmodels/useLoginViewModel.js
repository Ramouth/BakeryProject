import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';

export const useLoginViewModel = () => {
  const { currentUser, isLoading, error: contextError, login } = useUser();
  const navigate = useNavigate();
  const mounted = useRef(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track mounted/unmounted
  useEffect(() => () => { mounted.current = false }, []);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAdmin) navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const redirectAfterLogin = useCallback(user => {
    if (!mounted.current || !user) return;
    if (user.isAdmin) navigate('/admin', { replace: true });
    else navigate('/', { replace: true });
  }, [navigate]);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      redirectAfterLogin(user);
    } catch (err) {
      if (!mounted.current) return;
      setLocalError(err?.message || 'Login failed');
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  }, [email, password, login, redirectAfterLogin]);

  const handleMockLogin = useCallback(async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      const user = await login('admin@crumbcompass.com', 'admin123');
      redirectAfterLogin(user);
    } catch (err) {
      if (!mounted.current) return;
      setLocalError(err?.message || 'Mock login failed');
    } finally {
      if (mounted.current) setIsSubmitting(false);
    }
  }, [login, redirectAfterLogin]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading: isLoading || isSubmitting,
    error: localError || contextError,
    handleSubmit,
    handleMockLogin,
  };
};
