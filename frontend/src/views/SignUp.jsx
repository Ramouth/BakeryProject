import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import { useNotification } from '../store/NotificationContext';
import Button from '../components/Button';

const SignUp = () => {
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
    
    // Basic validation
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
  
  return (
    <div className="container">
      <div className="card">
        <h2>Create Account</h2>
        <p>Join CrumbCompass to start reviewing bakeries and products</p>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </Button>
            
            <Button 
              type="button"
              variant="link" 
              onClick={() => navigate('/login')}
            >
              Already have an account? Log in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;