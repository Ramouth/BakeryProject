import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import ThemeToggle from '../components/ThemeToggle';

const NavBar = () => {
  const { currentUser, logout } = useUser();
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>CrumbCompass</h1>
          <p>Copenhagen Bakery Reviews</p>
        </Link>
        
        <nav className="main-nav">
          <ul>
            <li className="nav-item">
              <ThemeToggle />
            </li>
            {currentUser ? (
              <li className="nav-item">
                {/* Use a div with the same class as Admin Login */}
                <div className="admin-login-container">
                  <Link to="/" onClick={logout} className="admin-login-button">Log Out</Link>
                </div>
              </li>
            ) : (
              <li className="nav-item">
                <div className="admin-login-container">
                  <Link to="/login" className="admin-login-button">Admin Login</Link>
                </div>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;