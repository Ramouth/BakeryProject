import { useState, useCallback, useEffect } from 'react';
import apiClient from '../../services/api';
import { BakeryReview } from '../../models/Review';
import { Bakery } from '../../models/Bakery';
import { showErrorNotification, showSuccessNotification } from '../../utils/notifications';

export const useAdminBakeryReviewViewModel = () => {
  const [reviews, setReviews] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reviewsResponse, bakeriesResponse, usersResponse] = await Promise.all([
        apiClient.get('/bakeryreviews', true),
        apiClient.get('/bakeries', true),
        apiClient.get('/users', true)
      ]);
      
      const reviewModels = (reviewsResponse.bakeryReviews || []).map(r => BakeryReview.fromApiResponse(r));
      const bakeryModels = (bakeriesResponse.bakeries || []).map(b => Bakery.fromApiResponse(b));
      
      setReviews(reviewModels);
      setBakeries(bakeryModels);
      setUsers(usersResponse.users || []);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      showErrorNotification('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleOpenCreateModal = useCallback(() => {
    setCurrentReview(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((review) => {
    setCurrentReview(review);
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
        showSuccessNotification('Review updated successfully!');
      } else {
        // Create
        await apiClient.post('/bakeryreviews/create', reviewData, false);
        showSuccessNotification('Review created successfully!');
      }
      
      handleCloseModal();
      await fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to save review.');
      showErrorNotification(`Failed to save review: ${err.message}`);
      throw err; // Re-throw for form error handling
    } finally {
      setIsLoading(false);
    }
  }, [currentReview, handleCloseModal, fetchReviews]);

  const handleDeleteReview = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.delete(`/bakeryreviews/delete/${id}`, false);
      showSuccessNotification('Review deleted successfully!');
      await fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to delete review.');
      showErrorNotification(`Failed to delete review: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchReviews]);

  return {
    reviews,
    bakeries,
    users,
    isModalOpen,
    currentReview,
    isLoading,
    error,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveReview,
    handleDeleteReview
  };
};