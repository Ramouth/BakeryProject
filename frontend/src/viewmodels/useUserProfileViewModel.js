import { useState, useEffect } from 'react';
import { useUser } from '../store/UserContext';
import { useNavigate } from 'react-router-dom';

export const useUserProfileViewModel = () => {
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
      // Mock data - in a real app, these would be API calls
      const stats = {
        totalReviews: 12,
        bakeryReviews: 5,
        productReviews: 7,
        averageRating: 4.2,
        mostRecentReview: '2024-04-01T12:00:00Z'
      };
      
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
          type: 'product',
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
          comment: 'Traditional Danish products with great quality.'
        },
        {
          id: 4,
          type: 'product',
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
      // In a real app, this would be an API call
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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

  return {
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
  };
};