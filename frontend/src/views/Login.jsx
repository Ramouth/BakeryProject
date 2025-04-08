import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import Button from '../components/Button';

const Login = () => {
  const { login, isLoading, error, currentUser } = useUser();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('admin@crumbcompass.com');
  const [password, setPassword] = useState('admin123');
  
  // Auto-redirect if already logged in
  useEffect(() => {
    if (currentUser && currentUser.isAdmin) {
      navigate('/admin');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = await login(email, password);
      
      if (user && user.isAdmin) {
        navigate('/admin');
      }
    } catch (err) {
      // Error is already handled by the useUser hook
      console.error('Login error:', err);
    }
  };
  
  // One-click login button for convenience
  const handleMockLogin = async () => {
    try {
      const user = await login('admin@crumbcompass.com', 'admin123');
      if (user && user.isAdmin) {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Mock login error:', err);
    }
  };
  
  return (
    <div className="container">
      <div className="card">
        <h2>Admin Login</h2>
        <p>Use the one-click login button or enter credentials below</p>
        
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <Button 
            onClick={handleMockLogin}
            disabled={isLoading}
          >
            One-Click Admin Login
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <p className="help-text" style={{ fontSize: '0.8rem', marginTop: '5px', color: '#666' }}>
              (Any password will work - authentication is mocked)
            </p>
          </div>
          
          {error && (
            <div className="error-text auth-error">
              {error}
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