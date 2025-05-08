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

  // New method to get category by ID
  async getCategoryById(categoryId) {
    const response = await apiClient.get(`/categories/${categoryId}`, true);
    return response;
  }

  // Updated methods to get categories and subcategories with correct paths
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

  // Create a new category 
  async createCategory(categoryData) {
    const response = await apiClient.post(`/categories/create`, categoryData);
    return response;
  }

  // Update an existing category
  async updateCategory(categoryId, categoryData) {
    const response = await apiClient.patch(`/categories/update/${categoryId}`, categoryData);
    return response;
  }

  // Delete a category
  async deleteCategory(categoryId) {
    const response = await apiClient.delete(`/categories/delete/${categoryId}`);
    return response;
  }

  // Create a new subcategory
  async createSubcategory(subcategoryData) {
    const response = await apiClient.post(`/categories/subcategories/create`, subcategoryData);
    return response;
  }

  // Update an existing subcategory
  async updateSubcategory(subcategoryId, subcategoryData) {
    const response = await apiClient.patch(`/categories/subcategories/update/${subcategoryId}`, subcategoryData);
    return response;
  }

  // Delete a subcategory
  async deleteSubcategory(subcategoryId) {
    const response = await apiClient.delete(`/categories/subcategories/delete/${subcategoryId}`);
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