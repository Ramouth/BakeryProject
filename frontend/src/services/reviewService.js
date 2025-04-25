import { BaseService } from './baseService';
import apiClient from './api';

class ReviewService extends BaseService {
  constructor() {
    super('');
  }

  // Bakery Reviews
  async getAllBakeryReviews() {
    const response = await apiClient.get('/bakeryreviews', true);
    return response;
  }

  async getBakeryReviewsByBakery(bakeryId) {
    const response = await apiClient.get(`/bakeryreviews/bakery/${bakeryId}`, true);
    return response;
  }

  async createBakeryReview(reviewData) {
    const response = await apiClient.post('/bakeryreviews/create', reviewData);
    return response;
  }

  async updateBakeryReview(id, reviewData) {
    const response = await apiClient.patch(`/bakeryreviews/update/${id}`, reviewData);
    return response;
  }

  async deleteBakeryReview(id) {
    const response = await apiClient.delete(`/bakeryreviews/delete/${id}`);
    return response;
  }

  // Product Reviews
  async getAllProductReviews() {
    const response = await apiClient.get('/productreviews', true);
    return response;
  }

  async getProductReviewsByProduct(productId) {
    const response = await apiClient.get(`/productreviews/product/${productId}`, true);
    return response;
  }

  async createProductReview(reviewData) {
    const response = await apiClient.post('/productreviews/create', reviewData);
    return response;
  }

  async updateProductReview(id, reviewData) {
    const response = await apiClient.patch(`/productreviews/update/${id}`, reviewData);
    return response;
  }

  async deleteProductReview(id) {
    const response = await apiClient.delete(`/productreviews/delete/${id}`);
    return response;
  }

  // Experience Rating
  async submitExperienceRating(ratingData) {
    const response = await apiClient.post('/api/experience-ratings', ratingData);
    return response;
  }
}

export default new ReviewService();