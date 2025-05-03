import { useUserProfileViewModel } from '../viewmodels/useUserProfileViewModel';
import Button from '../components/Button';
import '../styles/profile.css';

const UserProfile = () => {
  const {
    currentUser,
    userStats,
    reviewHistory,
    loading,
    activeTab,
    setActiveTab,
    editMode,
    setEditMode,
    userInfo,
    handleInputChange,
    handleProfileUpdate,
    handleLogout,
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
            <p className="profile-member-since">Member since April 2024</p>
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
                  <h2>Review History</h2>
                  
                  {reviewHistory.length === 0 ? (
                    <div className="no-reviews">
                      <p>You haven't written any reviews yet.</p>
                      <Button onClick={() => navigate('/bakery-selection')}>
                        Start Reviewing
                      </Button>
                    </div>
                  ) : (
                    <div className="review-list">
                      {reviewHistory.map(review => (
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <h3 className="review-item-name">{review.itemName}</h3>
                            <span className="review-type-badge">
                              {review.type === 'bakery' ? 'Bakery' : 'Product'}
                            </span>
                          </div>
                          
                          <div className="review-rating">
                            <span className="rating-value">{review.rating.toFixed(1)}</span>
                            <span className="cookies">🍪</span>
                            <span className="review-date">{formatDate(review.date)}</span>
                          </div>
                          
                          <p className="review-comment">{review.comment}</p>
                          
                          <div className="review-actions">
                            <button className="review-action-btn">Edit</button>
                            <button className="review-action-btn">Delete</button>
                          </div>
                        </div>
                      ))}
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
                      <span className="stat-detail">{formatDate(userStats.mostRecentReview)}</span>
                    </div>
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