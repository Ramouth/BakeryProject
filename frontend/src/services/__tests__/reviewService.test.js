import ReviewService from '../reviewService';
import apiClient from '../api';

jest.mock('../api');

describe('ReviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Bakery Reviews', () => {
    test('getBakeryReviewsByBakery calls API with correct bakery ID', async () => {
      const mockResponse = { 
        bakeryReviews: [
          { id: '1', overallRating: 8, review: 'Great bakery!' }
        ]
      };
      const bakeryId = '123';
      apiClient.get.mockResolvedValue(mockResponse);
      
      const result = await ReviewService.getBakeryReviewsByBakery(bakeryId);
      
      expect(apiClient.get).toHaveBeenCalledWith(`/bakeryreviews/bakery/${bakeryId}`, true);
      expect(result).toEqual(mockResponse);
    });
    
    test('createBakeryReview calls API with correct review data', async () => {
      const mockResponse = { success: true, id: '1' };
      const reviewData = { 
        bakeryId: '123', 
        overallRating: 8, 
        serviceRating: 7,
        priceRating: 9,
        review: 'Delicious pastries!' 
      };
      apiClient.post.mockResolvedValue(mockResponse);
      
      const result = await ReviewService.createBakeryReview(reviewData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/bakeryreviews/create', reviewData);
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('User Reviews', () => {
    test('getUserReviews fetches both bakery and product reviews', async () => {
      const userId = '456';
      const bakeryReviewsResponse = { 
        bakeryReviews: [
          { id: '1', bakeryId: '123', overallRating: 8 }
        ]
      };
      const productReviewsResponse = { 
        productReviews: [
          { id: '2', productId: '789', overallRating: 6 }
        ]
      };
      
      // Mock the API to return different responses based on the URL
      apiClient.get.mockImplementation((url) => {
        if (url.includes('/bakeryreviews/user/')) {
          return Promise.resolve(bakeryReviewsResponse);
        }
        if (url.includes('/productreviews/user/')) {
          return Promise.resolve(productReviewsResponse);
        }
        return Promise.resolve({});
      });
      
      const result = await ReviewService.getUserReviews(userId);
      
      expect(apiClient.get).toHaveBeenCalledWith(`/bakeryreviews/user/${userId}`, true);
      expect(apiClient.get).toHaveBeenCalledWith(`/productreviews/user/${userId}`, true);
      expect(result).toEqual({
        bakeryReviews: bakeryReviewsResponse.bakeryReviews,
        productReviews: productReviewsResponse.productReviews
      });
    });
    
    test('getUserReviewStats calculates stats correctly', async () => {
      const userId = '456';
      
      // Mock getUserReviews to return test data
      jest.spyOn(ReviewService, 'getUserReviews').mockResolvedValue({
        bakeryReviews: [
          { id: '1', overallRating: 8, created_at: '2023-05-01T12:00:00Z' },
          { id: '2', overallRating: 6, created_at: '2023-04-01T12:00:00Z' }
        ],
        productReviews: [
          { id: '3', overallRating: 10, created_at: '2023-05-15T12:00:00Z' }, // Most recent
          { id: '4', overallRating: 4, created_at: '2023-03-01T12:00:00Z' }
        ]
      });
      
      const result = await ReviewService.getUserReviewStats(userId);
      
      expect(ReviewService.getUserReviews).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        totalReviews: 4,
        bakeryReviews: 2,
        productReviews: 2,
        averageRating: 3.5, // (8 + 6 + 10 + 4) / 4 / 2 = 3.5 (converted to 5-star scale)
        mostRecentReview: expect.objectContaining({ id: '3' }) // The product review is most recent
      });
    });
  });
});