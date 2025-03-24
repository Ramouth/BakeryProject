import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import Button from '../components/Button';

const Login = () => {
  const { login, isLoading, error } = useUser();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  // Basic form validation
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const user = await login(email, password);
      
      if (user && user.isAdmin) {
        navigate('/admin');
      } else {
        setValidationErrors({ 
          auth: 'You do not have admin privileges'
        });
      }
    } catch (err) {
      // Error is already handled by the useUser hook
      console.error('Login error:', err);
    }
  };
  
  return (
    <div className="container">
      <div className="card">
        <h2>Admin Login</h2>
        <p>Please log in to access the admin area</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={validationErrors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <div className="error-text">{validationErrors.email}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={validationErrors.password ? 'error' : ''}
              disabled={isLoading}
            />
            {validationErrors.password && (
              <div className="error-text">{validationErrors.password}</div>
            )}
          </div>
          
          {(error || validationErrors.auth) && (
            <div className="error-text auth-error">
              {error || validationErrors.auth}
            </div>
          )}
          
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;