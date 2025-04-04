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
    console.log("Creating product with data:", productData);
    // Make sure we're sending empty strings instead of null for optional fields
    const sanitizedData = {
      name: productData.name,
      bakeryId: productData.bakeryId,
      category: productData.category || "",
      imageUrl: productData.imageUrl || ""
    };
    const response = await apiClient.post('/products/create', sanitizedData);
    return response;
  },

  /**
   * Update an existing product
   * @param {string|number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} - Updated product
   */
  updateProduct: async (id, productData) => {
    console.log("Updating product with data:", productData);
    // Make sure we're sending empty strings instead of null for optional fields
    const sanitizedData = {
      name: productData.name,
      bakeryId: productData.bakeryId,
      category: productData.category || "",
      imageUrl: productData.imageUrl || ""
    };
    const response = await apiClient.patch(`/products/update/${id}`, sanitizedData);
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

  /**
   * Get products by bakery ID
   * @param {string|number} bakeryId - Bakery ID
   * @returns {Promise<Array>} - List of products for the bakery
   */
  getProductsByBakery: async (bakeryId) => {
    const response = await apiClient.get(`/products/bakery/${bakeryId}`);
    return response.products;
  },

  /**
   * Get products by category
   * @param {string} category - Product category
   * @returns {Promise<Array>} - List of products in the category
   */
  getProductsByCategory: async (category) => {
    const response = await apiClient.get(`/products/category/${category}`);
    return response.products;
  }
};

export default productService;