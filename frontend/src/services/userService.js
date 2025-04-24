import { BaseService } from './baseService';
import apiClient from './api';

class UserService extends BaseService {
  constructor() {
    super('/users');
  }

  async register(userData) {
    // Registration might have a different endpoint structure
    const response = await apiClient.post('/users/register', userData);
    return response;
  }

  async login(credentials) {
    const response = await apiClient.post('/users/login', credentials);
    return response;
  }

  async getCurrentUser() {
    const response = await apiClient.get('/users/me', true);
    return response;
  }

  async updateProfile(userData) {
    const response = await apiClient.patch('/users/profile', userData);
    return response;
  }
}

export default new UserService();