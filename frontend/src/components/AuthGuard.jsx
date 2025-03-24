import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../store/UserContext';

/**
 * Authentication guard component to protect routes that require admin privileges
 * Redirects to login page if not authenticated
 */
const AuthGuard = ({ children }) => {
  const { currentUser, isLoading } = useUser();
  const location = useLocation();
  
  // Wait for authentication check to complete
  if (isLoading) {
    return <div className="loading">Checking authentication...</div>;
  }
  
  // Redirect to login if no user or not an admin
  if (!currentUser || !currentUser.isAdmin) {
    // Store the location they were trying to access for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default AuthGuard;