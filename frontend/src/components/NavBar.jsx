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
          <Link to="/login" className="login-button">
            Log in
          </Link>
          
          <Link to="/bakery-selection" className="sign-up-button">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default NavBar;