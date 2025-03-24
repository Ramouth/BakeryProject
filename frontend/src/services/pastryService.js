import apiClient from './api';

/**
 * Service for handling pastry-related API calls
 */
const pastryService = {
  /**
   * Get all pastries
   * @returns {Promise<Array>} - List of pastries
   */
  getAllPastries: async () => {
    const response = await apiClient.get('/pastries');
    return response.pastries;
  },

  /**
   * Create a new pastry
   * @param {Object} pastryData - Pastry data to create
   * @returns {Promise<Object>} - Created pastry
   */
  createPastry: async (pastryData) => {
    const response = await apiClient.post('/pastries/create', pastryData);
    return response;
  },

  /**
   * Update an existing pastry
   * @param {string|number} id - Pastry ID
   * @param {Object} pastryData - Updated pastry data
   * @returns {Promise<Object>} - Updated pastry
   */
  updatePastry: async (id, pastryData) => {
    const response = await apiClient.patch(`/pastries/update/${id}`, pastryData);
    return response;
  },

  /**
   * Delete a pastry
   * @param {string|number} id - Pastry ID
   * @returns {Promise<Object>} - Deletion response
   */
  deletePastry: async (id) => {
    const response = await apiClient.delete(`/pastries/delete/${id}`);
    return response;
  },
};

export default pastryService;