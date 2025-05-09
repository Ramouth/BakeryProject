import { renderHook, act } from '@testing-library/react-hooks';
import { jest } from '@jest/globals';

let useBakeryRankingsViewModel;
let mockApiGet;
let mockBakeryServiceInstance;

// Mock dependencies
beforeEach(async () => {
  jest.resetModules();

  mockApiGet = jest.fn();
  
  mockBakeryServiceInstance = {
    getTopBakeries: jest.fn(),
  };

  await jest.unstable_mockModule('../../services/api', () => ({
    default: {
      get: mockApiGet,
    },
  }));

  await jest.unstable_mockModule('../../services/bakeryService', () => ({
    default: mockBakeryServiceInstance,
  }));
  
  const viewModelModule = await import('../useBakeryRankingsViewModel');
  useBakeryRankingsViewModel = viewModelModule.useBakeryRankingsViewModel;
});

describe('useBakeryRankingsViewModel', () => {
  test('initial state is correct', () => {
    const { result } = renderHook(() => useBakeryRankingsViewModel());
    expect(result.current.rankings).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('fetches rankings successfully', async () => {
    const mockRankings = [{ id: '1', name: 'Bakery A', average_rating: 4.5, review_count: 10 }];
    mockBakeryServiceInstance.getTopBakeries.mockResolvedValue({ bakeries: mockRankings });

    const { result, waitForNextUpdate } = renderHook(() => useBakeryRankingsViewModel());

    await act(async () => {
      await waitForNextUpdate();
    });
    
    expect(mockBakeryServiceInstance.getTopBakeries).toHaveBeenCalledWith(10);
    expect(result.current.rankings).toEqual(mockRankings);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('handles error when fetching rankings', async () => {
    const errorMessage = 'Failed to fetch';
    mockBakeryServiceInstance.getTopBakeries.mockRejectedValue(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() => useBakeryRankingsViewModel());
    
    await act(async () => {
        await waitForNextUpdate();
    });

    expect(result.current.rankings).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  test('fetches rankings with a specific limit', async () => {
    const mockRankings = [{ id: '1', name: 'Bakery A' }];
    mockBakeryServiceInstance.getTopBakeries.mockResolvedValue({ bakeries: mockRankings });

    const { result, waitForNextUpdate } = renderHook(() => useBakeryRankingsViewModel(5));

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(mockBakeryServiceInstance.getTopBakeries).toHaveBeenCalledWith(5);
    expect(result.current.rankings).toEqual(mockRankings);
  });
});