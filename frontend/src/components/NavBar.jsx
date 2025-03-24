import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../store/UserContext';

const NavBar = () => {
  const { currentUser, logout } = useUser();
  const location = useLocation();
  
  // Only show on certain paths where it makes sense
  const hiddenPaths = ['/thank-you'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>CrumbCompass</h1>
          <p>Copenhagen Bakery Reviews</p>
        </Link>
        
        <nav className="main-nav">
          <ul>
            {currentUser && currentUser.isAdmin && (
              <li>
                <Link to="/admin">Admin</Link>
              </li>
            )}
            {currentUser ? (
              <>
                <li>
                  <span className="user-greeting">Hello, {currentUser.firstName}</span>
                </li>
                <li>
                  <button onClick={logout} className="btn-link">
                    Log Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login">Admin Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;