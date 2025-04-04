import apiClient from './api';

/**
 * Service for handling user-related API calls
 */
const userService = {
  /**
   * Get all users
   * @returns {Promise<Array>} - List of users
   */
  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response.users;
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  createUser: async (userData) => {
    const response = await apiClient.post('/users/create', userData);
    return response;
  },

  /**
   * Update an existing user
   * @param {string|number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} - Updated user
   */
  updateUser: async (id, userData) => {
    const response = await apiClient.patch(`/users/update/${id}`, userData);
    return response;
  },

  /**
   * Delete a user
   * @param {string|number} id - User ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/delete/${id}`);
    return response;
  },
};

export default userService;