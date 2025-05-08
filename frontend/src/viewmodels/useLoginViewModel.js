import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';

export const useLoginViewModel = () => {
  const { currentUser, isLoading, error: contextError, login } = useUser();
  const navigate = useNavigate();
  const mounted = useRef(true);

  // Keep email naming for UI compatibility
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track mounted/unmounted
  useEffect(() => () => { mounted.current = false }, []);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAdmin) navigate('/admin-dashboard', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const redirectAfterLogin = useCallback(user => {
    if (!mounted.current || !user) return;
    if (user.isAdmin) navigate('/admin-dashboard', { replace: true });
    else navigate('/', { replace: true });
  }, [navigate]);

  const handleSubmit = useCallback(async e => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    setLocalError(null);
    setIsSubmitting(true);
    
    try {
      // Using email as username
      const user = await login(email, password);
      if (user) {
        redirectAfterLogin(user);
      } else {
        // If login returns falsy but doesn't throw
        setLocalError('Invalid credentials');
        setIsSubmitting(false);
      }
    } catch (err) {
      // Error handling for failed login
      console.error('Login error:', err);
      setLocalError(err?.message || 'Login failed');
      setIsSubmitting(false);
    }
  }, [email, password, login, redirectAfterLogin]);

  const handleMockLogin = useCallback(async () => {
    setLocalError(null);
    setIsSubmitting(true);
    
    try {
      // Keep the same mock login credentials
      const user = await login('admin@crumbcompass.com', 'admin123');
      redirectAfterLogin(user);
    } catch (err) {
      if (mounted.current) {
        setLocalError(err?.message || 'Mock login failed');
      }
      setIsSubmitting(false);
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