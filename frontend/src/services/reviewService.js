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
   * Create a bakery review - contactId now optional
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
   * Get all pastry reviews
   * @returns {Promise<Array>} - List of pastry reviews
   */
  getAllPastryReviews: async () => {
    const response = await apiClient.get('/pastryreviews');
    return response.pastryreviews;
  },

  /**
   * Create a pastry review - contactId now optional
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} - Created review
   */
  createPastryReview: async (reviewData) => {
    const response = await apiClient.post('/pastryreviews/create', reviewData);
    return response;
  },

  /**
   * Update a pastry review
   * @param {string|number} id - Review ID
   * @param {Object} reviewData - Updated review data
   * @returns {Promise<Object>} - Updated review
   */
  updatePastryReview: async (id, reviewData) => {
    const response = await apiClient.patch(`/pastryreviews/update/${id}`, reviewData);
    return response;
  },

  /**
   * Delete a pastry review
   * @param {string|number} id - Review ID
   * @returns {Promise<Object>} - Deletion response
   */
  deletePastryReview: async (id) => {
    const response = await apiClient.delete(`/pastryreviews/delete/${id}`);
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