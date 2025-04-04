import apiClient from './api';

/**
 * Service for handling bakery-related API calls
 */
const bakeryService = {
  /**
   * Get all bakeries
   * @returns {Promise<Array>} - List of bakeries
   */
  getAllBakeries: async () => {
    const response = await apiClient.get('/bakeries');
    return response.bakeries;
  },

  /**
   * Create a new bakery
   * @param {Object} bakeryData - Bakery data to create
   * @returns {Promise<Object>} - Created bakery
   */
  createBakery: async (bakeryData) => {
    const response = await apiClient.post('/bakeries/create', bakeryData);
    return response;
  },

  /**
   * Update an existing bakery
   * @param {string|number} id - Bakery ID
   * @param {Object} bakeryData - Updated bakery data
   * @returns {Promise<Object>} - Updated bakery
   */
  updateBakery: async (id, bakeryData) => {
    const response = await apiClient.patch(`/bakeries/update/${id}`, bakeryData);
    return response;
  },

  /**
   * Delete a bakery
   * @param {string|number} id - Bakery ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteBakery: async (id) => {
    const response = await apiClient.delete(`/bakeries/delete/${id}`);
    return response;
  },

  /**
   * Get all products for a bakery
   * @param {string|number} bakeryId - Bakery ID
   * @returns {Promise<Array>} - List of products
   */
  getBakeryProducts: async (bakeryId) => {
    const response = await apiClient.get(`/bakeries/${bakeryId}/products`);
    return response.products;
  },
};

export default bakeryService;