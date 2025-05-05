import { useSignUpViewModel } from '../viewmodels/useSignUpViewModel';
import Button from '../components/Button';

const SignUp = () => {
  const {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
    navigate
  } = useSignUpViewModel();
  
  return (
    <div className="container">
      <div className="card">
        <h2>Create Account</h2>
        <p>Join CrumbCompass to start reviewing bakeries and products</p>
        
                        <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-group">
                  <label htmlFor="username">Username:</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      minLength={3}
                      maxLength={24}
                      disabled={isSubmitting}
                    />
                    <span className="char-counter">
                      {formData.username.length}/24
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={50}
                      disabled={isSubmitting}
                    />
                    <span className="char-counter">
                      {formData.email.length}/50
                    </span>
                  </div>
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
          
          <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </Button>
            
            <p className="login-link">
               <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Already have an account? Log in</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;