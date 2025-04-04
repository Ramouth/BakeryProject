import apiClient from './api';

const productService = {
  /**
   * Get all products
   * @returns {Promise<Array>} - List of products
   */
  getAllProducts: async () => {
    try {
      const response = await apiClient.get('/products');
      
      // Extensive logging
      console.log('Full product API response:', response);
      
      // Check different possible response structures
      if (response && response.products) {
        console.log('Returning products from .products key');
        return response.products;
      } else if (Array.isArray(response)) {
        console.log('Returning response directly as array');
        return response;
      } else {
        console.warn('Unexpected product response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @returns {Promise<Object>} - Created product
   */
  createProduct: async (productData) => {
    console.log("Creating product with data:", productData);
    
    // Ensure data matches backend expectations
    const sanitizedData = {
      name: productData.name,
      bakeryId: productData.bakeryId,
      category: productData.category || '',
      imageUrl: productData.imageUrl || ''
    };
    
    const response = await apiClient.post('/products/create', sanitizedData);
    return response.product || response;
  },

  /**
   * Update an existing product
   * @param {string|number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} - Updated product
   */
  updateProduct: async (id, productData) => {
    console.log(`Updating product ${id} with data:`, productData);
    
    // Ensure data matches backend expectations
    const sanitizedData = {
      name: productData.name,
      bakeryId: productData.bakeryId,
      category: productData.category || '',
      imageUrl: productData.imageUrl || ''
    };
    
    const response = await apiClient.patch(`/products/update/${id}`, sanitizedData);
    return response.product || response;
  },

  /**
   * Delete a product
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/delete/${id}`);
    return response;
  }
};

export default productService;