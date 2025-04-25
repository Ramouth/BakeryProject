import { useState, useCallback, useEffect } from 'react';
import apiClient from '../../services/api';
import { ProductReview } from '../../models/Review';
import { Product } from '../../models/Product';
import { useNotification } from '../../store/NotificationContext';

export const useAdminProductReviewViewModel = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reviewsResponse, productsResponse, usersResponse] = await Promise.all([
        apiClient.get('/productreviews', true),
        apiClient.get('/products', true),
        apiClient.get('/users', true)
      ]);
      
      const reviewModels = (reviewsResponse.productReviews || []).map(r => ProductReview.fromApiResponse(r));
      const productModels = (productsResponse.products || []).map(p => Product.fromApiResponse(p));
      
      setReviews(reviewModels);
      setProducts(productModels);
      setUsers(usersResponse.users || []);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      showError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

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
        await apiClient.patch(`/productreviews/update/${currentReview.id}`, reviewData, false);
        showSuccess('Review updated successfully!');
      } else {
        // Create
        await apiClient.post('/productreviews/create', reviewData, false);
        showSuccess('Review created successfully!');
      }
      
      handleCloseModal();
      await fetchReviews();
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
      await apiClient.delete(`/productreviews/delete/${id}`, false);
      showSuccess('Review deleted successfully!');
      await fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to delete review.');
      showError(`Failed to delete review: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchReviews, showSuccess, showError]);

  return {
    reviews,
    products,
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