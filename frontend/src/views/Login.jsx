import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import Button from '../components/Button';

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    handleMockLogin
  } = useLoginViewModel();
  
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
            <label htmlFor="email">Username or Email:</label>
            <input
              type="text" // Changed from type="email" to allow usernames
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your username or email"
            />
            <p className="help-text" style={{ fontSize: '0.8rem', marginTop: '5px', color: '#666' }}>
              This field accepts either username or email address
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your password"
            />
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