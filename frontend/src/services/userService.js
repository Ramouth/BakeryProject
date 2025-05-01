import { BaseService } from './baseService';
import apiClient from './api';

class UserService extends BaseService {
  constructor() {
    super('/users');
  }

  // Authentication endpoints
  async register(userData) {
    // Use the correct auth endpoint for registration
    const response = await apiClient.post('/auth/register', userData);
    return response;
  }

  async login(credentials) {
    // Use the correct auth endpoint for login
    const response = await apiClient.post('/auth/login', credentials);
    return response;
  }

  async getCurrentUser() {
    // Use the correct auth endpoint for getting profile
    const response = await apiClient.get('/auth/profile');
    return response;
  }

  async updateProfile(userData) {
    // Use the correct auth endpoint for updating profile
    const response = await apiClient.patch('/auth/update-profile', userData);
    return response;
  }

  async changePassword(passwordData) {
    // Add change password functionality
    const response = await apiClient.post('/auth/change-password', passwordData);
    return response;
  }

  // Regular user management endpoints (for admin use)
  async getAllUsers() {
    return this.getAll();
  }

  async getUserById(id) {
    return this.getById(id);
  }

  async createUser(userData) {
    return this.create(userData);
  }

  async updateUser(id, userData) {
    return this.update(id, userData);
  }

  async deleteUser(id) {
    return this.delete(id);
  }
}

export default new UserService();