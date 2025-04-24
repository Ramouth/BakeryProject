import apiClient from './api';

export class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async getAll(useCache = true) {
    const response = await apiClient.get(this.endpoint, useCache);
    return response;
  }

  async getById(id, useCache = true) {
    const response = await apiClient.get(`${this.endpoint}/${id}`, useCache);
    return response;
  }

  async create(data) {
    const response = await apiClient.post(`${this.endpoint}/create`, data);
    return response;
  }

  async update(id, data) {
    const response = await apiClient.patch(`${this.endpoint}/update/${id}`, data);
    return response;
  }

  async delete(id) {
    const response = await apiClient.delete(`${this.endpoint}/delete/${id}`);
    return response;
  }
}