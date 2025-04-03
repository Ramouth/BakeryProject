import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import ThemeToggle from './ThemeToggle';

const NavBar = () => {
  const { currentUser, logout } = useUser();
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <Link to="/" className="logo">
            <h1>CrumbCompass</h1>
          </Link>
        </div>
        
        <div className="nav-links">
          <Link to="/bakery-rankings" className="nav-link">Bakery Rankings</Link>
          <Link to="/product-categories" className="nav-link">Product Rankings</Link>
        </div>
        
        <div className="header-actions">
          {currentUser ? (
            <>
              <Link to="/bakery-selection" className="review-button">
                <span className="plus-icon">+</span>
                <span className="separator"></span>
                <span>Review</span>
              </Link>
              <Link to="/profile" className="profile-icon" title="View Profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="login-button">
                Log in
              </Link>
              
              <Link to="/bakery-selection" className="sign-up-button">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;