import { useState, useCallback, useEffect, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useNotification();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch reviews, products, and users in parallel without caching for fresh data
      const [reviewsResponse, productsResponse, usersResponse] = await Promise.all([
        apiClient.get('/productreviews', false), // Don't use cache for reviews
        apiClient.get('/products', true),
        apiClient.get('/users', true)
      ]);
      
      console.log("Product reviews API response:", reviewsResponse);
      
      // Extract reviews and add product information
      let productReviews = reviewsResponse.productReviews || [];
      const productMap = {};
      
      // Create a lookup map for products
      if (productsResponse.products && productsResponse.products.length > 0) {
        productsResponse.products.forEach(product => {
          productMap[product.id] = product;
        });
      }
      
      // Enhance reviews with product data
      productReviews = productReviews.map(review => {
        const product = productMap[review.productId];
        return {
          ...review,
          product: product || null,
          product_name: product ? product.name : 'Unknown Product'
        };
      });
      
      console.log("Processed product reviews:", productReviews);
      
      setReviews(productReviews);
      setProducts(productsResponse.products || []);
      setUsers(usersResponse.users || []);
    } catch (err) {
      console.error("Failed to fetch review data:", err);
      setError('Failed to fetch data. Please try again.');
      showError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Filter reviews based on search term
  const filteredReviews = useMemo(() => {
    if (!searchTerm.trim()) {
      return reviews;
    }
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    return reviews.filter(review => 
      review.review && review.review.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [reviews, searchTerm]);

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
    searchTerm,
    setSearchTerm,
    filteredReviews,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveReview,
    handleDeleteReview
  };
};