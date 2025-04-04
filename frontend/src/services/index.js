// Service module bundle with lazy initialization

import apiClient from './api';

// Service factory with lazy initialization
const createServiceFactory = (serviceInitializer) => {
  let serviceInstance = null;
  
  return () => {
    if (!serviceInstance) {
      serviceInstance = serviceInitializer(apiClient);
    }
    return serviceInstance;
  };
};

// Bakery service factory
const bakeryServiceFactory = createServiceFactory((api) => ({
  getAllBakeries: async () => {
    const response = await api.get('/bakeries');
    return response.bakeries;
  },
  
  getBakeryById: async (id) => {
    const response = await api.get(`/bakeries/${id}`);
    return response;
  },
  
  createBakery: async (bakeryData) => {
    return api.post('/bakeries/create', bakeryData);
  },
  
  updateBakery: async (id, bakeryData) => {
    return api.patch(`/bakeries/update/${id}`, bakeryData);
  },
  
  deleteBakery: async (id) => {
    return api.delete(`/bakeries/delete/${id}`);
  },
  
  getBakeryStats: async (id) => {
    const response = await api.get(`/bakeries/stats/${id}`);
    return response;
  }
}));

// Product service factory
const productServiceFactory = createServiceFactory((api) => ({
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.products;
  },
  
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response;
  },
  
  getProductsByBakery: async (bakeryId) => {
    const response = await api.get(`/products/bakery/${bakeryId}`);
    return response.products;
  },
  
  createProduct: async (productData) => {
    return api.post('/products/create', productData);
  },
  
  updateProduct: async (id, productData) => {
    return api.patch(`/products/update/${id}`, productData);
  },
  
  deleteProduct: async (id) => {
    return api.delete(`/products/delete/${id}`);
  },
  
  getProductStats: async (id) => {
    const response = await api.get(`/products/stats/${id}`);
    return response;
  }
}));

// Review service factory
const reviewServiceFactory = createServiceFactory((api) => ({
  // Bakery reviews
  getAllBakeryReviews: async () => {
    const response = await api.get('/bakeryreviews');
    return response.bakeryreviews;
  },
  
  getBakeryReviewsByBakery: async (bakeryId) => {
    const response = await api.get(`/bakeryreviews/bakery/${bakeryId}`);
    return response.bakeryreviews;
  },
  
  createBakeryReview: async (reviewData) => {
    return api.post('/bakeryreviews/create', reviewData);
  },
  
  updateBakeryReview: async (id, reviewData) => {
    return api.patch(`/bakeryreviews/update/${id}`, reviewData);
  },
  
  deleteBakeryReview: async (id) => {
    return api.delete(`/bakeryreviews/delete/${id}`);
  },
  
  // Product reviews
  getAllProductReviews: async () => {
    const response = await api.get('/productreviews');
    return response.productreviews;
  },
  
  getProductReviewsByProduct: async (productId) => {
    const response = await api.get(`/productreviews/product/${productId}`);
    return response.productreviews;
  },
  
  createProductReview: async (reviewData) => {
    return api.post('/productreviews/create', reviewData);
  },
  
  updateProductReview: async (id, reviewData) => {
    return api.patch(`/productreviews/update/${id}`, reviewData);
  },
  
  deleteProductReview: async (id) => {
    return api.delete(`/productreviews/delete/${id}`);
  },
}));

// User/contact service factory
const userServiceFactory = createServiceFactory((api) => ({
  getAllContacts: async () => {
    const response = await api.get('/contacts');
    return response.contacts;
  },
  
  getContactById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response;
  },
  
  createContact: async (contactData) => {
    return api.post('/contacts/create', contactData);
  },
  
  updateContact: async (id, contactData) => {
    return api.patch(`/contacts/update/${id}`, contactData);
  },
  
  deleteContact: async (id) => {
    return api.delete(`/contacts/delete/${id}`);
  }
}));

// Export service instances
export const bakeryService = bakeryServiceFactory();
export const productService = productServiceFactory();
export const reviewService = reviewServiceFactory();
export const userService = userServiceFactory();

// Also export the API client for direct use
export { apiClient };