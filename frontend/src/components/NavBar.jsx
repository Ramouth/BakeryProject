import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import { User } from 'lucide-react';
import ReviewModal from './ReviewModal';

const NavBar = () => {
  const { currentUser, logout } = useUser();
  const location = useLocation();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
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
                <span className="plus-icon">+</span>
                <span className="separator"></span>
                <span>Review</span>
              </button>
              <Link to="/profile" className="profile-icon" title="View Profile">
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
                <span className="plus-icon">+</span>
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