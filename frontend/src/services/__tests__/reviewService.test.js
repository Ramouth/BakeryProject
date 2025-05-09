import { jest } from '@jest/globals';

// Declare these at the top level so they can be accessed in tests
let ReviewService;
let mockApiGet, mockApiPost, mockApiPatch, mockApiDelete;

beforeEach(async () => {
  // Reset modules to ensure ReviewService gets the fresh mock of apiClient
  jest.resetModules();

  // Create fresh mock functions for each test
  mockApiGet = jest.fn();
  mockApiPost = jest.fn();
  mockApiPatch = jest.fn();
  mockApiDelete = jest.fn();

  // Mock the '../api' module
  // The factory function now returns the actual mock functions
  await jest.unstable_mockModule('../api', () => ({
    default: {
      get: mockApiGet,
      post: mockApiPost,
      patch: mockApiPatch,
      delete: mockApiDelete,
    },
  }));

  // Dynamically import the ReviewService *after* '../api' has been mocked
  const reviewServiceModule = await import('../reviewService');
  ReviewService = reviewServiceModule.default; // Assuming ReviewService is a default export
});

describe('ReviewService', () => {
  // No need for a separate beforeAll or top-level mockApiClient variable

  describe('Bakery Reviews', () => {
    test('getBakeryReviewsByBakery calls API with correct bakery ID', async () => {
      const mockResponse = {
        bakeryReviews: [
          { id: '1', overallRating: 8, review: 'Great bakery!' }
        ]
      };
      const bakeryId = '123';
      mockApiGet.mockResolvedValue(mockResponse); // Use the specific mock function

      const result = await ReviewService.getBakeryReviewsByBakery(bakeryId);

      expect(mockApiGet).toHaveBeenCalledWith(`/bakeryreviews/bakery/${bakeryId}`, true);
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
      mockApiPost.mockResolvedValue(mockResponse); // Use the specific mock function

      const result = await ReviewService.createBakeryReview(reviewData);

      expect(mockApiPost).toHaveBeenCalledWith('/bakeryreviews/create', reviewData);
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

      mockApiGet.mockImplementation((url) => { // Use the specific mock function
        if (url.includes(`/bakeryreviews/user/${userId}`)) {
          return Promise.resolve(bakeryReviewsResponse);
        }
        if (url.includes(`/productreviews/user/${userId}`)) {
          return Promise.resolve(productReviewsResponse);
        }
        return Promise.resolve({});
      });

      const result = await ReviewService.getUserReviews(userId);

      expect(mockApiGet).toHaveBeenCalledWith(`/bakeryreviews/user/${userId}`, true);
      expect(mockApiGet).toHaveBeenCalledWith(`/productreviews/user/${userId}`, true);
      expect(result).toEqual({
        bakeryReviews: bakeryReviewsResponse.bakeryReviews,
        productReviews: productReviewsResponse.productReviews
      });
    });

    test('getUserReviewStats calculates stats correctly', async () => {
      const userId = '456';
      // Mock API responses
      mockApiGet.mockImplementation((url) => {
        if (url === `/bakeryreviews/user/${userId}`) {
          return Promise.resolve({
            bakeryReviews: [
              { id: 'b1', overallRating: 8, created_at: '2023-01-01T10:00:00Z' },
              { id: 'b2', overallRating: 6, created_at: '2023-01-02T10:00:00Z' }
            ]
          });
        }
        if (url === `/productreviews/user/${userId}`) {
          return Promise.resolve({
            productReviews: [
              { id: 'p1', overallRating: 10, created_at: '2023-01-03T10:00:00Z' },
              { id: 'p2', overallRating: 4, created_at: '2022-12-31T10:00:00Z' } 
            ]
          });
        }
        return Promise.resolve({});
      });

      const stats = await ReviewService.getUserReviewStats(userId);

      expect(stats).toEqual({ 
        totalReviews: 4,
        averageRating: 7.0, // Should be (8+6+10+4)/4 = 7
        mostRecentReview: expect.objectContaining({ id: 'p1' })
      });
    });
  });
});