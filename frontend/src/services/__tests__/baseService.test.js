import { jest } from '@jest/globals';

let BaseService; // To hold the class
let mockApiGet, mockApiPost, mockApiPatch, mockApiDelete; // Mock functions

const testEndpoint = '/test';

// Use a beforeEach to set up mocks and import the service for each test
beforeEach(async () => {
  jest.resetModules(); // Reset modules to ensure BaseService gets the fresh mock

  // Create fresh mock functions for each test
  mockApiGet = jest.fn();
  mockApiPost = jest.fn();
  mockApiPatch = jest.fn();
  mockApiDelete = jest.fn();

  // Mock the '../api' module
  await jest.unstable_mockModule('../api', () => ({
    default: {
      get: mockApiGet,
      post: mockApiPost,
      patch: mockApiPatch,
      delete: mockApiDelete,
    },
  }));

  // Dynamically import the BaseService *after* '../api' has been mocked
  const baseServiceModule = await import('../baseService');
  BaseService = baseServiceModule.BaseService; // Assuming BaseService is a named export
});

describe('BaseService', () => {
  let service; // This will be an instance of BaseService

  // Create a new service instance before each test that needs it
  beforeEach(() => {
    service = new BaseService(testEndpoint);
  });

  test('constructor sets endpoint', () => {
    expect(service.endpoint).toBe(testEndpoint);
  });

  test('getAll calls API with correct endpoint', async () => {
    const mockResponse = { data: ['item1', 'item2'] };
    mockApiGet.mockResolvedValue(mockResponse); // Use the specific mock function

    const result = await service.getAll();

    expect(mockApiGet).toHaveBeenCalledWith(testEndpoint, true);
    expect(result).toEqual(mockResponse);
  });

  test('getById calls API with correct ID', async () => {
    const id = '123';
    const mockResponse = { data: { id: '123', name: 'Test Item' } };
    mockApiGet.mockResolvedValue(mockResponse); // Use the specific mock function

    const result = await service.getById(id);

    expect(mockApiGet).toHaveBeenCalledWith(`${testEndpoint}/${id}`, true);
    expect(result).toEqual(mockResponse);
  });

  test('create calls API with correct data', async () => {
    const data = { name: 'New Item' };
    const mockResponse = { success: true, id: '456' };
    mockApiPost.mockResolvedValue(mockResponse); // Use the specific mock function

    const result = await service.create(data);

    expect(mockApiPost).toHaveBeenCalledWith(`${testEndpoint}/create`, data); // Removed third argument
    expect(result).toEqual(mockResponse);
  });

  test('update calls API with correct ID and data', async () => {
    const id = '123';
    const data = { name: 'Updated Item' };
    const mockResponse = { success: true };
    mockApiPatch.mockResolvedValue(mockResponse); // Use the specific mock function

    const result = await service.update(id, data);

    expect(mockApiPatch).toHaveBeenCalledWith(`${testEndpoint}/update/${id}`, data); // Removed third argument
    expect(result).toEqual(mockResponse);
  });

  test('delete calls API with correct ID', async () => {
    const id = '123';
    const mockResponse = { success: true };
    mockApiDelete.mockResolvedValue(mockResponse); // Use the specific mock function
    
    const result = await service.delete(id);
    
    // Ensure your BaseService.delete method constructs the URL like this
    // or adjust the expectation if it's just `${testEndpoint}/${id}`
    expect(mockApiDelete).toHaveBeenCalledWith(`${testEndpoint}/delete/${id}`); 
    expect(result).toEqual(mockResponse);
  });
});