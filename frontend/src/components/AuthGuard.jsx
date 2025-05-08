import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../store/UserContext';

/**
 * Authentication guard component that can protect routes requiring either
 * regular user authentication or admin privileges
 */
const AuthGuard = ({ children, requireAdmin = false }) => {
  const { currentUser, isLoading } = useUser();
  const location = useLocation();
  
  // Wait for authentication check to complete
  if (isLoading) {
    return <div className="loading">Checking authentication...</div>;
  }
  
  // Check if token exists but no user is loaded
  const hasToken = !!localStorage.getItem('access_token');
  
  // Redirect to login if no user or token
  if (!currentUser && !hasToken) {
    // Store the location they were trying to access for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If requiring admin access, check admin status
  if (requireAdmin && (!currentUser || !currentUser.isAdmin)) {
    // Either redirect to login or unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render children if authenticated properly
  return children;
};

export default AuthGuard;