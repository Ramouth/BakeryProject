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

// Pastry service factory
const pastryServiceFactory = createServiceFactory((api) => ({
  getAllPastries: async () => {
    const response = await api.get('/pastries');
    return response.pastries;
  },
  
  getPastryById: async (id) => {
    const response = await api.get(`/pastries/${id}`);
    return response;
  },
  
  getPastriesByBakery: async (bakeryId) => {
    const response = await api.get(`/pastries/bakery/${bakeryId}`);
    return response.pastries;
  },
  
  createPastry: async (pastryData) => {
    return api.post('/pastries/create', pastryData);
  },
  
  updatePastry: async (id, pastryData) => {
    return api.patch(`/pastries/update/${id}`, pastryData);
  },
  
  deletePastry: async (id) => {
    return api.delete(`/pastries/delete/${id}`);
  },
  
  getPastryStats: async (id) => {
    const response = await api.get(`/pastries/stats/${id}`);
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
  
  // Pastry reviews
  getAllPastryReviews: async () => {
    const response = await api.get('/pastryreviews');
    return response.pastryreviews;
  },
  
  getPastryReviewsByPastry: async (pastryId) => {
    const response = await api.get(`/pastryreviews/pastry/${pastryId}`);
    return response.pastryreviews;
  },
  
  createPastryReview: async (reviewData) => {
    return api.post('/pastryreviews/create', reviewData);
  },
  
  updatePastryReview: async (id, reviewData) => {
    return api.patch(`/pastryreviews/update/${id}`, reviewData);
  },
  
  deletePastryReview: async (id) => {
    return api.delete(`/pastryreviews/delete/${id}`);
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
export const pastryService = pastryServiceFactory();
export const reviewService = reviewServiceFactory();
export const userService = userServiceFactory();

// Also export the API client for direct use
export { apiClient };