import { BaseService } from './baseService';
import apiClient from './api';

class ProductService extends BaseService {
  constructor() {
    super('/products');
  }

  async getProductsByBakery(bakeryId) {
    const response = await apiClient.get(`/bakeries/${bakeryId}/products`, true);
    return response;
  }

  async getProductsByCategory(category) {
    const response = await apiClient.get(`${this.endpoint}/category/${category}`, true);
    return response;
  }

  async getProductsBySubcategory(subcategory) {
    const response = await apiClient.get(`${this.endpoint}/subcategory/${subcategory}`, true);
    return response;
  }

  // New methods to get categories and subcategories directly from API
  async getAllCategories() {
    const response = await apiClient.get(`/categories`, true);
    return response;
  }
  
  async getAllSubcategories() {
    const response = await apiClient.get(`/categories/subcategories`, true);
    return response;
  }
  
  async getSubcategoriesByCategory(categoryId) {
    const response = await apiClient.get(`/categories/${categoryId}/subcategories`, true);
    return response;
  }

  async searchProducts(query) {
    const response = await apiClient.get(`${this.endpoint}/search?q=${query}`, true);
    return response;
  }

  async getProductStats(id) {
    const response = await apiClient.get(`${this.endpoint}/${id}/stats`, true);
    return response;
  }
}

export default new ProductService();