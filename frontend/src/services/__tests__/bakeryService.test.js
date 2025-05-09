import { jest } from '@jest/globals';

let BakeryService; 
let mockApiGet, mockApiPost, mockApiPatch, mockApiDelete;

beforeEach(async () => {
  jest.resetModules();

  mockApiGet = jest.fn();
  mockApiPost = jest.fn();
  mockApiPatch = jest.fn();
  mockApiDelete = jest.fn();

  await jest.unstable_mockModule('../api', () => ({
    default: {
      get: mockApiGet,
      post: mockApiPost,
      patch: mockApiPatch,
      delete: mockApiDelete,
    },
  }));

  const bakeryServiceModule = await import('../bakeryService');
  BakeryService = bakeryServiceModule.default; // bakeryServiceModule.default is the instance
  console.log('Imported BakeryService:', BakeryService, 'Type:', typeof BakeryService); // DEBUG LOG
});

describe('BakeryService', () => {
  test('getBakeries calls API and returns bakeries', async () => {
    const mockResponse = { bakeries: [{ id: '1', name: 'Test Bakery' }] };
    mockApiGet.mockResolvedValue(mockResponse);

    console.log('BakeryService before call:', BakeryService); // DEBUG LOG
    console.log('typeof BakeryService.getBakeries:', typeof BakeryService.getBakeries); // DEBUG LOG
    if (BakeryService && BakeryService.constructor && BakeryService.constructor.prototype) { // DEBUG LOG
        console.log('BakeryService methods from prototype:', Object.getOwnPropertyNames(BakeryService.constructor.prototype)); // DEBUG LOG
    } else if (BakeryService) {
        console.log('BakeryService direct methods:', Object.getOwnPropertyNames(BakeryService)); // DEBUG LOG
    }

    const result = await BakeryService.getBakeries(); // Use the imported instance

    expect(mockApiGet).toHaveBeenCalledWith('/bakeries', true);
    expect(result).toEqual(mockResponse);
  });

  test('getBakeryById calls API with correct ID', async () => {
    const bakeryId = '123';
    const mockResponse = { id: bakeryId, name: 'Specific Bakery' };
    mockApiGet.mockResolvedValue(mockResponse);

    console.log('BakeryService before call (getBakeryById):', BakeryService); // DEBUG LOG
    console.log('typeof BakeryService.getBakeryById:', typeof BakeryService.getBakeryById); // DEBUG LOG

    const result = await BakeryService.getBakeryById(bakeryId); // Use the imported instance

    expect(mockApiGet).toHaveBeenCalledWith(`/bakeries/${bakeryId}`, true);
    expect(result).toEqual(mockResponse);
  });

  test('getTopBakeries calls API with correct endpoint and limit', async () => {
    const mockResponse = {
      bakeries: [
        { id: '1', name: 'Top Bakery 1', average_rating: 9.5 },
        { id: '2', name: 'Top Bakery 2', average_rating: 9.2 }
      ]
    };
    mockApiGet.mockResolvedValue(mockResponse);
    
    const result = await BakeryService.getTopBakeries(2); // Use the imported instance
    
    expect(mockApiGet).toHaveBeenCalledWith('/bakeries/top?limit=2', true); 
    expect(result).toEqual(mockResponse);
  });

  test('getBakeryStats calls API with correct bakery ID', async () => {
    const mockResponse = {
      review_count: 50,
      average_rating: 8.7
    };
    const bakeryId = '123';
    mockApiGet.mockResolvedValue(mockResponse);
    
    const result = await BakeryService.getBakeryStats(bakeryId); // Use the imported instance
    
    expect(mockApiGet).toHaveBeenCalledWith(`/bakeries/${bakeryId}/stats`, true);
    expect(result).toEqual(mockResponse);
  });

  test('searchBakeries calls API with correct search query', async () => {
    const mockResponse = {
      bakeries: [
        { id: '3', name: 'Cake Shop' }
      ]
    };
    const searchQuery = 'cake';
    mockApiGet.mockResolvedValue(mockResponse);
    
    const result = await BakeryService.searchBakeries(searchQuery); // Use the imported instance
    
    expect(mockApiGet).toHaveBeenCalledWith(`/bakeries/search?q=${searchQuery}`, true);
    expect(result).toEqual(mockResponse);
  });

   test('getBakeryProducts calls API with correct bakery ID', async () => {
    const mockResponse = {
      products: [
        { id: 'p1', name: 'Croissant' },
        { id: 'p2', name: 'Pain au Chocolat' }
      ]
    };
    const bakeryId = '123';
    mockApiGet.mockResolvedValue(mockResponse);
    
    const result = await BakeryService.getBakeryProducts(bakeryId); // Use the imported instance
    
    expect(mockApiGet).toHaveBeenCalledWith(`/bakeries/${bakeryId}/products`, true); 
    expect(result).toEqual(mockResponse);
  });
});