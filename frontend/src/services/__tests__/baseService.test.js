import { BaseService } from '../baseService';
import apiClient from '../api';

jest.mock('../api');

describe('BaseService', () => {
  let service;
  const testEndpoint = '/test-endpoint';
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new BaseService(testEndpoint);
  });
  
  test('getAll calls API client with correct endpoint', async () => {
    const mockResponse = { data: [{ id: 1 }, { id: 2 }] };
    apiClient.get.mockResolvedValue(mockResponse);
    
    const result = await service.getAll();
    
    expect(apiClient.get).toHaveBeenCalledWith(testEndpoint, true);
    expect(result).toEqual(mockResponse);
  });
  
  test('getById calls API client with correct URL', async () => {
    const mockResponse = { id: 1, name: 'Test Item' };
    const id = '123';
    apiClient.get.mockResolvedValue(mockResponse);
    
    const result = await service.getById(id);
    
    expect(apiClient.get).toHaveBeenCalledWith(`${testEndpoint}/${id}`, true);
    expect(result).toEqual(mockResponse);
  });
  
  test('create calls API client with correct endpoint and data', async () => {
    const mockResponse = { id: 1, name: 'New Item' };
    const testData = { name: 'New Item' };
    apiClient.post.mockResolvedValue(mockResponse);
    
    const result = await service.create(testData);
    
    expect(apiClient.post).toHaveBeenCalledWith(`${testEndpoint}/create`, testData);
    expect(result).toEqual(mockResponse);
  });
  
  test('update calls API client with correct URL and data', async () => {
    const id = '123';
    const mockResponse = { id, name: 'Updated Item' };
    const testData = { name: 'Updated Item' };
    apiClient.patch.mockResolvedValue(mockResponse);
    
    const result = await service.update(id, testData);
    
    expect(apiClient.patch).toHaveBeenCalledWith(`${testEndpoint}/update/${id}`, testData);
    expect(result).toEqual(mockResponse);
  });
  
  test('delete calls API client with correct URL', async () => {
    const id = '123';
    const mockResponse = { success: true };
    apiClient.delete.mockResolvedValue(mockResponse);
    
    const result = await service.delete(id);
    
    expect(apiClient.delete).toHaveBeenCalledWith(`${testEndpoint}/delete/${id}`);
    expect(result).toEqual(mockResponse);
  });
});