import { useState, useCallback, useEffect, useMemo } from 'react';
import apiClient from '../../services/api';
import { BakeryReview } from '../../models/Review';
import { Bakery } from '../../models/Bakery';
import { useNotification } from '../../store/NotificationContext';

export const useAdminBakeryReviewViewModel = () => {
  const [reviews, setReviews] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allReviews, setAllReviews] = useState([]);
  const { showSuccess, showError } = useNotification();

  const fetchReviews = useCallback(async (page = 1, loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      // Fetch reviews, bakeries, and users in parallel
      const [reviewsResponse, bakeriesResponse, usersResponse] = await Promise.all([
        apiClient.get('/bakeryreviews', false), // Fetch fresh data, don't use cache
        apiClient.get('/bakeries', true),
        apiClient.get('/users', true)
      ]);
      
      console.log("Bakery reviews API response:", reviewsResponse);
      
      // Extract reviews and add bakery information
      let bakeryReviews = reviewsResponse.bakeryReviews || [];
      const bakeryMap = {};
      
      // Create a lookup map for bakeries
      if (bakeriesResponse.bakeries && bakeriesResponse.bakeries.length > 0) {
        bakeriesResponse.bakeries.forEach(bakery => {
          bakeryMap[bakery.id] = bakery;
        });
      }
      
      // Enhance reviews with bakery data
      bakeryReviews = bakeryReviews.map(review => {
        const bakery = bakeryMap[review.bakeryId];
        return {
          ...review,
          bakery: bakery || null,
          bakery_name: bakery ? bakery.name : 'Unknown Bakery'
        };
      });
      
      // Store all reviews for search filtering
      setAllReviews(bakeryReviews);
      
      // Implement pagination
      const totalPages = Math.ceil(bakeryReviews.length / pageSize);
      setHasMore(page < totalPages);
      
      if (loadMore) {
        // Add more reviews to existing ones
        setReviews(prev => [
          ...prev,
          ...bakeryReviews.slice((page - 1) * pageSize, page * pageSize)
        ]);
      } else {
        // First load or reset
        setReviews(bakeryReviews.slice(0, page * pageSize));
      }
      
      setBakeries(bakeriesResponse.bakeries || []);
      setUsers(usersResponse.users || []);
      setCurrentPage(page);
      
      console.log("Processed bakery reviews:", bakeryReviews);
    } catch (err) {
      console.error("Failed to fetch review data:", err);
      setError('Failed to fetch data. Please try again.');
      showError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [pageSize, showError]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const loadMoreReviews = useCallback(() => {
    fetchReviews(currentPage + 1, true);
  }, [fetchReviews, currentPage]);

  // Filter reviews based on search term
  const filteredReviews = useMemo(() => {
    if (!searchTerm.trim()) {
      return reviews;
    }
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    // Filter from all reviews (not just currently displayed ones)
    const filtered = allReviews.filter(review => 
      review.review && review.review.toLowerCase().includes(normalizedSearchTerm)
    );
    
    // Reset pagination when searching
    setHasMore(filtered.length > pageSize);
    return filtered.slice(0, pageSize);
  }, [reviews, allReviews, searchTerm, pageSize]);

  const handleOpenCreateModal = useCallback(() => {
    setCurrentReview(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((review) => {
    // Make a copy to avoid reference issues
    setCurrentReview({...review});
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentReview(null);
  }, []);

  const handleSaveReview = useCallback(async (reviewData) => {
    setIsLoading(true);
    try {
      if (currentReview?.id) {
        // Update
        await apiClient.patch(`/bakeryreviews/update/${currentReview.id}`, reviewData, false);
        showSuccess('Review updated successfully!');
      } else {
        // Create
        await apiClient.post('/bakeryreviews/create', reviewData, false);
        showSuccess('Review created successfully!');
      }
      
      handleCloseModal();
      await fetchReviews(1, false); // Reset to first page after changes
    } catch (err) {
      setError(err.message || 'Failed to save review.');
      showError(`Failed to save review: ${err.message}`);
      throw err; // Re-throw for form error handling
    } finally {
      setIsLoading(false);
    }
  }, [currentReview, handleCloseModal, fetchReviews, showSuccess, showError]);

  const handleDeleteReview = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.delete(`/bakeryreviews/delete/${id}`, false);
      showSuccess('Review deleted successfully!');
      await fetchReviews(1, false); // Reset to first page after deletion
    } catch (err) {
      setError(err.message || 'Failed to delete review.');
      showError(`Failed to delete review: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchReviews, showSuccess, showError]);

  return {
    reviews,
    bakeries,
    users,
    isModalOpen,
    currentReview,
    isLoading,
    isLoadingMore,
    error,
    searchTerm,
    setSearchTerm,
    filteredReviews,
    hasMore,
    loadMoreReviews,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveReview,
    handleDeleteReview
  };
};