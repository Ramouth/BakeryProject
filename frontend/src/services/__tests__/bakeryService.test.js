import BakeryService from '../bakeryService';
import apiClient from '../api';

jest.mock('../api');

describe('BakeryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('getTopBakeries calls API with correct endpoint and limit', async () => {
    const mockResponse = { 
      bakeries: [
        { id: '1', name: 'Top Bakery' },
        { id: '2', name: 'Second Bakery' }
      ]
    };
    apiClient.get.mockResolvedValue(mockResponse);
    
    const result = await BakeryService.getTopBakeries(2);
    
    expect(apiClient.get).toHaveBeenCalledWith('/bakeries/top?limit=2', true);
    expect(result).toEqual(mockResponse);
  });
  
  test('getBakeryStats calls API with correct bakery ID', async () => {
    const mockResponse = { 
      average_rating: 4.5,
      review_count: 10
    };
    const bakeryId = '123';
    apiClient.get.mockResolvedValue(mockResponse);
    
    const result = await BakeryService.getBakeryStats(bakeryId);
    
    expect(apiClient.get).toHaveBeenCalledWith(`/bakeries/${bakeryId}/stats`, true);
    expect(result).toEqual(mockResponse);
  });
  
  test('searchBakeries calls API with correct search query', async () => {
    const mockResponse = { 
      bakeries: [
        { id: '1', name: 'Cake Bakery' }
      ]
    };
    const searchQuery = 'cake';
    apiClient.get.mockResolvedValue(mockResponse);
    
    const result = await BakeryService.searchBakeries(searchQuery);
    
    expect(apiClient.get).toHaveBeenCalledWith(`/bakeries/search?q=${searchQuery}`, true);
    expect(result).toEqual(mockResponse);
  });
  
  test('getBakeryProducts calls API with correct bakery ID', async () => {
    const mockResponse = { 
      products: [
        { id: '1', name: 'Chocolate Cake' },
        { id: '2', name: 'Croissant' }
      ]
    };
    const bakeryId = '123';
    apiClient.get.mockResolvedValue(mockResponse);
    
    const result = await BakeryService.getBakeryProducts(bakeryId);
    
    expect(apiClient.get).toHaveBeenCalledWith(`/bakeries/${bakeryId}/products`, true);
    expect(result).toEqual(mockResponse);
  });
});