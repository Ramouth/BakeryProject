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
    handleSubmit
  } = useLoginViewModel();
  
  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <p>Enter credentials to review</p>
        
        <div className="login-form">
          <div className="form-group">
            <label htmlFor="email">Username or Email:</label>
            <input 
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.getElementById('password').focus();
                }
              }}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          
          {error && (
            <div className="error-text auth-error">
              {error}
            </div>
          )}
          
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;