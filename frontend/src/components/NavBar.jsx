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
                <button onClick={logout} className="btn-link">
                  Log Out
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <Link to="/login" className="login-button">Admin Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;