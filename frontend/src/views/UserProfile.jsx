import { useState } from 'react';
import { useUserProfileViewModel } from '../viewmodels/useUserProfileViewModel';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

// New component for collapsible review text
const CollapsibleReviewText = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Don't add collapse functionality for short reviews
  if (!text || text.length < 100) {
    return <p className="review-comment">{text}</p>;
  }
  
  return (
    <div>
      <p className={`review-comment ${expanded ? '' : 'collapsed'}`}>
        {text}
      </p>
      <button 
        className="read-more-btn" 
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
};

const UserProfile = () => {
  const {
    currentUser,
    userStats,
    reviewHistory,
    loading,
    error,
    activeTab,
    setActiveTab,
    editMode,
    setEditMode,
    userInfo,
    handleInputChange,
    handleProfileUpdate,
    handleLogout,
    handleDeleteReview,
    formatDate,
    navigate
  } = useUserProfileViewModel();

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to get user initials from username
  const getUserInitials = (username) => {
    if (!username) return '';
    // Handle different username formats: "John Doe", "john.doe", "john_doe", etc.
    const parts = username.split(/[\s._-]/);
    if (parts.length > 1) {
      // If username has multiple parts, use first letters of first and last parts
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    } else {
      // If username is a single word, use first letter or first two letters
      return username.substring(0, Math.min(2, username.length)).toUpperCase();
    }
  };

  // Helper function to get a display name from username
  const getDisplayName = (username) => {
    if (!username) return '';
    // Convert username to display name: "john_doe" -> "John Doe"
    return username
      .split(/[\s._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  // Helper function to determine how long user has been a member
  const getMemberSince = (user) => {
    if (!user || !user.createdAt) return 'New member';
    
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    
    // If created less than a month ago
    const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + 
                        now.getMonth() - createdDate.getMonth();
    
    if (monthsDiff < 1) return 'Member since this month';
    if (monthsDiff === 1) return 'Member since last month';
    
    // Format the date
    return `Member since ${createdDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })}`;
  };

  // Helper to render cookie rating display (similar to other components)
  const renderCookieRating = (rating) => {
    const displayRating = rating; // Already in 0-5 scale
    const fullCookies = Math.floor(displayRating);
    const hasHalfCookie = displayRating % 1 >= 0.5;
    const emptyCookies = 5 - fullCookies - (hasHalfCookie ? 1 : 0);
    
    return (
      <div className="cookie-display cookie-small">
        {Array(fullCookies).fill().map((_, i) => (
          <span key={`full-${i}`} className="cookie-filled">🍪</span>
        ))}
        {hasHalfCookie && (
          <div className="cookie-half-container">
            <span className="cookie-half">🍪</span>
          </div>
        )}
        {Array(emptyCookies).fill().map((_, i) => (
          <span key={`empty-${i}`} className="cookie-empty">🍪</span>
        ))}
      </div>
    );
  };

  // Helper function to format bakery/product names for URLs
  const formatNameForUrl = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {getUserInitials(currentUser?.username)}
          </div>
          
          <div className="profile-header-info">
            <h1>{getDisplayName(currentUser?.username)}</h1>
            <p className="profile-email">{currentUser?.email}</p>
            <p className="profile-member-since">{getMemberSince(currentUser)}</p>
          </div>
          
          <div className="profile-actions">
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
            
            <Button 
              variant="primary" 
              size="small"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
        
        {editMode ? (
          <div className="profile-edit-form">
            <h2>Edit Profile</h2>
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={userInfo.username}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userInfo.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-actions">
              <Button 
                variant="secondary" 
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleProfileUpdate}
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-tabs">
              <button 
                className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                My Reviews
              </button>
              <button 
                className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                Activity Stats
              </button>
            </div>
            
            <div className="profile-content">
              {activeTab === 'reviews' && (
                <div className="review-history">
                  <h2>Your Recent Reviews</h2>
                  
                  {reviewHistory.length === 0 ? (
                    <div className="no-reviews">
                      <p>You haven't written any reviews yet.</p>
                      <Button onClick={() => navigate('/bakery-rankings')}>
                        Explore Bakeries to Review
                      </Button>
                    </div>
                  ) : (
                    <div className="review-list">
                      {reviewHistory.map(review => (
                        // Add the unique containing class here: user-profile-review-card
                        <div key={`${review.type}-${review.id}`} className="review-card user-profile-review-card">
                          <div className="review-header">
                            <div className="review-title-section">
                              {/* Product/Bakery Name as Link */}
                              {review.type === 'bakery' ? (
                                <Link 
                                  to={`/bakery/${encodeURIComponent(formatNameForUrl(review.itemName))}`} 
                                  className="review-item-name"
                                >
                                  {review.itemName}
                                </Link>
                              ) : (
                                <Link 
                                  to={`/product/${review.itemId}`} 
                                  className="review-item-name"
                                >
                                  {review.itemName}
                                </Link>
                              )}
                              
                              {/* Bakery Name for Product Reviews */}
                              {review.type === 'product' && review.bakeryName && (
                                <Link 
                                  to={`/bakery/${encodeURIComponent(formatNameForUrl(review.bakeryName))}`}
                                  className="review-bakery-name"
                                >
                                  {review.bakeryName}
                                </Link>
                              )}
                            </div>
                            
                            <span className="review-type-badge">
                              {review.type === 'bakery' ? 'Bakery' : 'Product'}
                            </span>
                          </div>
                          
                          <div className="review-content">
                            <div className="review-left">
                              {/* Replace the regular paragraph with our collapsible component */}
                              <CollapsibleReviewText text={review.comment} />
                            </div>
                            
                            <div className="review-right">
                              <div className="review-rating-row">
                                <div className="rating-value">{review.rating.toFixed(1)}</div>
                                {renderCookieRating(review.rating)}
                              </div>
                              <div className="review-date">{formatDate(review.date)}</div>
                            </div>
                          </div>
                          
                          <div className="review-actions">
                            <button 
                              className="review-action-btn edit-btn"
                              onClick={() => {
                                // Navigate to the review page with this review's ID
                                navigate(`/${review.type}-review/${review.id}/edit`);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="review-action-btn delete-btn"
                              onClick={() => handleDeleteReview(review.id, review.type)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {reviewHistory.length > 0 && userStats.totalReviews > reviewHistory.length && (
                        <div className="see-more-reviews">
                          <Button variant="secondary" onClick={() => navigate('/user/reviews')}>
                            See All {userStats.totalReviews} Reviews
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'stats' && userStats && (
                <div className="profile-stats">
                  <h2>Activity Statistics</h2>
                  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{userStats.totalReviews}</div>
                      <div className="stat-label">Total Reviews</div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-value">{userStats.bakeryReviews}</div>
                      <div className="stat-label">Bakery Reviews</div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-value">{userStats.productReviews}</div>
                      <div className="stat-label">Product Reviews</div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-value">{userStats.averageRating.toFixed(1)}</div>
                      <div className="stat-label">Average Rating</div>
                    </div>
                  </div>
                  
                  <div className="additional-stats">                 
                    <div className="stat-row">
                      <span className="stat-label">Last Review:</span>
                      <span className="stat-detail">{formatDate(userStats.mostRecentReview) || 'No reviews yet'}</span>
                    </div>

                    {userStats.totalReviews > 0 && (
                      <div className="review-distribution">
                        <h3>Your Reviewing Activity</h3>
                        <div className="rating-distribution-chart">
                          {/* Here you could add a chart showing review distribution */}
                          <p>You've reviewed {userStats.bakeryReviews} bakeries and {userStats.productReviews} products.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;