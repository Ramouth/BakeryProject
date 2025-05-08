import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../store/UserContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import reviewService from '../services/reviewService';

export const useUserProfileViewModel = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const [reviewLimit, setReviewLimit] = useState(10);
  const [userStats, setUserStats] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      setUserInfo({
        username: currentUser.username || '',
        email: currentUser.email || ''
      });
      
      fetchUserData();
    }
  }, [currentUser, navigate]);

  const fetchUserData = async () => {
    if (!currentUser || !currentUser.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use reviewLimit instead of hardcoded 15
      const [recentReviews, stats] = await Promise.all([
        reviewService.getUserRecentReviews(currentUser.id, reviewLimit),
        reviewService.getUserReviewStats(currentUser.id)
      ]);
      
      setReviewHistory(recentReviews);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = useCallback(async () => {
    if (!currentUser || !currentUser.id) return;
    
    const newLimit = reviewLimit + 10; // Increase limit by 5
    setReviewLimit(newLimit);
    
    setLoading(true);
    try {
      // Fetch more reviews with the increased limit
      const moreReviews = await reviewService.getUserRecentReviews(currentUser.id, newLimit);
      setReviewHistory(moreReviews);
    } catch (error) {
      console.error('Error loading more reviews:', error);
      setError('Failed to load more reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, reviewLimit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      
      // Call the API to update the user profile
      const updatedUser = await apiClient.patch(`/users/update/${currentUser.id}`, {
        username: userInfo.username,
        email: userInfo.email
      });
      
      // Update the current user in context if needed
      // Note: This would typically be handled by your UserContext
      
      setEditMode(false);
      
      // Refresh user data after update
      await fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleDeleteReview = async (reviewId, reviewType) => {
    if (!window.confirm(`Are you sure you want to delete this ${reviewType} review?`)) {
      return; // User canceled the deletion
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the service method to delete the review
      await reviewService.deleteReview(reviewId, reviewType);
      
      // Update the review history by removing the deleted review
      setReviewHistory(prevReviews => 
        prevReviews.filter(review => !(review.id === reviewId && review.type === reviewType))
      );
      
      // Update the stats (decrement the appropriate count)
      setUserStats(prevStats => {
        if (!prevStats) return null;
        
        return {
          ...prevStats,
          totalReviews: prevStats.totalReviews - 1,
          [reviewType === 'bakery' ? 'bakeryReviews' : 'productReviews']: 
            prevStats[reviewType === 'bakery' ? 'bakeryReviews' : 'productReviews'] - 1
        };
      });
      
    } catch (error) {
      console.error(`Error deleting ${reviewType} review:`, error);
      setError(`Failed to delete review. ${error.message || 'Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
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
    navigate,
    loadMoreReviews,
  };
};