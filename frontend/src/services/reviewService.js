import apiClient from './api';

/**
 * Service for handling review-related API calls
 */
const reviewService = {
  /**
   * Get all bakery reviews
   * @returns {Promise<Array>} - List of bakery reviews
   */
  getAllBakeryReviews: async () => {
    const response = await apiClient.get('/bakeryreviews');
    return response.bakeryreviews;
  },

  /**
   * Create a bakery review - userId now optional
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} - Created review
   */
  createBakeryReview: async (reviewData) => {
    const response = await apiClient.post('/bakeryreviews/create', reviewData);
    return response;
  },

  /**
   * Update a bakery review
   * @param {string|number} id - Review ID
   * @param {Object} reviewData - Updated review data
   * @returns {Promise<Object>} - Updated review
   */
  updateBakeryReview: async (id, reviewData) => {
    const response = await apiClient.patch(`/bakeryreviews/update/${id}`, reviewData);
    return response;
  },

  /**
   * Delete a bakery review
   * @param {string|number} id - Review ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteBakeryReview: async (id) => {
    const response = await apiClient.delete(`/bakeryreviews/delete/${id}`);
    return response;
  },

  /**
   * Get all product reviews
   * @returns {Promise<Array>} - List of product reviews
   */
  getAllProductReviews: async () => {
    const response = await apiClient.get('/productreviews');
    return response.productreviews;
  },

  /**
   * Create a product review - userId now optional
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} - Created review
   */
  createProductReview: async (reviewData) => {
    const response = await apiClient.post('/productreviews/create', reviewData);
    return response;
  },

  /**
   * Update a product review
   * @param {string|number} id - Review ID
   * @param {Object} reviewData - Updated review data
   * @returns {Promise<Object>} - Updated review
   */
  updateProductReview: async (id, reviewData) => {
    const response = await apiClient.patch(`/productreviews/update/${id}`, reviewData);
    return response;
  },

  /**
   * Delete a product review
   * @param {string|number} id - Review ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteProductReview: async (id) => {
    const response = await apiClient.delete(`/productreviews/delete/${id}`);
    return response;
  },

  /**
   * Submit application review experience rating
   * @param {Object} ratingData - Rating data
   * @returns {Promise<Object>} - Rating submission response
   */
  submitExperienceRating: async (ratingData) => {
    const response = await apiClient.post('/api/experience-ratings', ratingData);
    return response;
  },
};

export default reviewService;