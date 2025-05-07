import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import { User, Plus } from 'lucide-react';
import ReviewModal from './ReviewModal';

const NavBar = () => {
  const { currentUser, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const openReviewModal = () => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          reviewIntent: true 
        } 
      });
    } else {
      setIsReviewModalOpen(true);
    }
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  // Determine profile path based on user role
  const getProfilePath = () => {
    if (currentUser && currentUser.isAdmin) {
      return '/admin-dashboard';
    }
    return '/profile';
  };

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
              <button onClick={openReviewModal} className="review-button">
                <Plus size={16} />
                <span className="separator"></span>
                <span>Review</span>
              </button>
              <Link to={getProfilePath()} className="profile-icon" title={currentUser.isAdmin ? "Admin Dashboard" : "View Profile"}>
                <User size={24} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="login-button">
                Log in
              </Link>
              
              <Link to="/signup" className="sign-up-button">
                Sign up
              </Link>
              
              <button onClick={openReviewModal} className="review-button">
                <Plus size={16} />
                <span className="separator"></span>
                <span>Review</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Connected Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={closeReviewModal} 
      />
    </header>
  );
};

export default NavBar;