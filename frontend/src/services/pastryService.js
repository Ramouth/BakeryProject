import apiClient from './api';

/**
 * Service for handling product-related API calls
 */
const productService = {
  /**
   * Get all products
   * @returns {Promise<Array>} - List of products
   */
  getAllProducts: async () => {
    const response = await apiClient.get('/products');
    return response.products;
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @returns {Promise<Object>} - Created product
   */
  createProduct: async (productData) => {
    const response = await apiClient.post('/products/create', productData);
    return response;
  },

  /**
   * Update an existing product
   * @param {string|number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} - Updated product
   */
  updateProduct: async (id, productData) => {
    const response = await apiClient.patch(`/products/update/${id}`, productData);
    return response;
  },

  /**
   * Delete a product
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/delete/${id}`);
    return response;
  },
};

export default productService;