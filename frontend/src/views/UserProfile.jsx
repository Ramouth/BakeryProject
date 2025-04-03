import { useState, useEffect } from 'react';
import { useUser } from '../store/UserContext';
import { useNavigate } from 'react-router-dom';
import { reviewService, userService } from '../services';
import Button from '../components/Button';
import '../styles/profile.css';

const UserProfile = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  
  const [userStats, setUserStats] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      setUserInfo({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      });
      
      fetchUserData();
    }
  }, [currentUser, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // In a real application, these would be actual API calls
      // For now, we'll use mock data that matches our application structure
      
      // Mock API call for user stats
      const stats = {
        totalReviews: 12,
        bakeryReviews: 5,
        pastryReviews: 7,
        averageRating: 4.2,
        mostRecentReview: '2024-04-01T12:00:00Z'
      };
      
      // Mock API call for review history
      const reviews = [
        {
          id: 1,
          type: 'bakery',
          itemName: 'Lagkagehuset',
          rating: 4.5,
          date: '2024-04-01T12:00:00Z',
          comment: 'Great atmosphere and friendly staff!'
        },
        {
          id: 2,
          type: 'pastry',
          itemName: 'Kanelsnegl (Lagkagehuset)',
          rating: 4.8,
          date: '2024-04-01T12:15:00Z',
          comment: 'Best cinnamon roll in Copenhagen!'
        },
        {
          id: 3,
          type: 'bakery',
          itemName: 'Andersen Bakery',
          rating: 4.2,
          date: '2024-03-22T10:30:00Z',
          comment: 'Traditional Danish pastries with great quality.'
        },
        {
          id: 4,
          type: 'pastry',
          itemName: 'Tebirkes (Andersen Bakery)',
          rating: 4.1,
          date: '2024-03-22T10:45:00Z',
          comment: 'Crispy and well-baked, but a bit too sweet for my taste.'
        }
      ];
      
      setUserStats(stats);
      setReviewHistory(reviews);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      // In a real app, this would be an API call to update the user profile
      // await userService.updateContact(currentUser.id, userInfo);
      
      // For demo purposes, we'll just update the state
      setEditMode(false);
      // Here you would show a success notification
    } catch (error) {
      console.error('Error updating profile:', error);
      // Here you would show an error notification
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
          </div>
          
          <div className="profile-header-info">
            <h1>{currentUser?.firstName} {currentUser?.lastName}</h1>
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
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userInfo.firstName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={userInfo.lastName}
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
                              {review.type === 'bakery' ? 'Bakery' : 'Pastry'}
                            </span>
                          </div>
                          
                          <div className="review-rating">
                            <span className="rating-value">{review.rating.toFixed(1)}</span>
                            <span className="stars">★★★★★</span>
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
                      <div className="stat-value">{userStats.pastryReviews}</div>
                      <div className="stat-label">Pastry Reviews</div>
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