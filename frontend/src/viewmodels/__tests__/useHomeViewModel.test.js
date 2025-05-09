import { renderHook, act } from '@testing-library/react';
import { useHomeViewModel } from '../useHomeViewModel';
import apiClient from '../../services/api';
import { useNotification } from '../../store/NotificationContext';
import { useRatingResetContext } from '../../store/RatingContext';

// Mock dependencies
jest.mock('../../services/api');
jest.mock('../../store/NotificationContext');
jest.mock('../../store/RatingContext');

describe('useHomeViewModel', () => {
  const mockResetReview = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    useNotification.mockReturnValue({
      showSuccess: jest.fn(),
      showError: jest.fn()
    });
    
    useRatingResetContext.mockReturnValue({
      resetReview: mockResetReview
    });
    
    // Mock API response for top bakeries
    apiClient.get.mockImplementation((url) => {
      if (url.includes('/bakeries')) {
        return Promise.resolve({
          bakeries: [
            { id: '1', name: 'Best Bakery', streetName: 'Main St', zipCode: '1050' },
            { id: '2', name: 'Great Bakery', streetName: 'Side St', zipCode: '1060' }
          ]
        });
      } else if (url.includes('/stats')) {
        return Promise.resolve({
          average_rating: 9.0,
          ratings: { overall: 9.0 },
          review_count: 15
        });
      }
      return Promise.resolve({});
    });
  });
  
  test('initializes and fetches top bakeries', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useHomeViewModel());
    
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.topBakeries).toHaveLength(2);
    expect(result.current.topBakeries[0].name).toBe('Best Bakery');
  });
  
  test('handles search input changes', async () => {
    const { result } = renderHook(() => useHomeViewModel());
    
    act(() => {
      result.current.setSearchType('product');
    });
    expect(result.current.searchType).toBe('product');
    
    act(() => {
      result.current.setSelectedZipCode('1050');
    });
    expect(result.current.selectedZipCode).toBe('1050');
    
    act(() => {
      result.current.setSelectedProductType('bread');
    });
    expect(result.current.selectedProductType).toBe('bread');
    
    act(() => {
      result.current.setSelectedRating('4');
    });
    expect(result.current.selectedRating).toBe('4');
  });
  
  test('formats bakery description correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useHomeViewModel());
    await waitForNextUpdate();
    
    const bakery = {
      description: "Custom description",
      streetName: "Main Street",
      streetNumber: "42",
      zipCode: "1050"
    };
    
    const description = result.current.getBakeryDescription(bakery);
    expect(description).toBe("Custom description");
    
    // Test fallback to location when no description
    const bakeryNoDesc = {
      streetName: "Main Street",
      streetNumber: "42",
      zipCode: "1050"
    };
    
    const fallbackDesc = result.current.getBakeryDescription(bakeryNoDesc);
    expect(fallbackDesc).toContain("Main Street");
    expect(fallbackDesc).toContain("42");
    expect(fallbackDesc).toContain("Inner City"); // District for 1050
  });
  
  test('converts bakery rating from 10-scale to 5-scale', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useHomeViewModel());
    await waitForNextUpdate();
    
    // Test direct average_rating
    const bakeryWithAvgRating = {
      average_rating: 8.0
    };
    
    const rating1 = result.current.getBakeryRating(bakeryWithAvgRating);
    expect(rating1).toBe("4.0"); // 8.0 / 2 = 4.0
    
    // Test using ratings.overall
    const bakeryWithOverall = {
      ratings: {
        overall: 6.0
      }
    };
    
    const rating2 = result.current.getBakeryRating(bakeryWithOverall);
    expect(rating2).toBe("3.0"); // 6.0 / 2 = 3.0
  });
});