import { BaseService } from './baseService';
import apiClient from './api';

class BakeryService extends BaseService {
  constructor() {
    super('/bakeries');
  }

  async getTopBakeries(limit = 4) {
    const response = await apiClient.get(`${this.endpoint}/top?limit=${limit}`, true);
    return response;
  }

  async getBakeryStats(id) {
    const response = await apiClient.get(`${this.endpoint}/${id}/stats`, true);
    return response;
  }

  async searchBakeries(query) {
    const response = await apiClient.get(`${this.endpoint}/search?q=${query}`, true);
    return response;
  }

  async getBakeryProducts(bakeryId) {
    const response = await apiClient.get(`${this.endpoint}/${bakeryId}/products`, true);
    return response;
  }
}

export default new BakeryService();