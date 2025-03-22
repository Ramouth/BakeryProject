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
          <h1>Bakery Reviews</h1>
          <p>Copenhagen + Frederiksberg</p>
        </Link>
        
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {currentUser && currentUser.isAdmin && (
              <li>
                <Link to="/admin">Admin</Link>
              </li>
            )}
            {currentUser ? (
              <li>
                <button onClick={logout} className="btn-link">
                  Log Out
                </button>
              </li>
            ) : (
              <li>
                <Link to="/login">Log In</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;