import { BaseService } from './baseService';
import apiClient from './api';

class ReviewService extends BaseService {
  constructor() {
    super('');
  }

  // Bakery Reviews
  async getAllBakeryReviews() {
    try {
      const response = await apiClient.get('/bakeryreviews', true);
      return response;
    } catch (error) {
      console.error('Error fetching bakery reviews:', error);
      throw error;
    }
  }

  async getBakeryReviewsByUser(userId) {
    try {
      const response = await apiClient.get(`/bakeryreviews/user/${userId}`, true);
      return response;
    } catch (error) {
      console.error(`Error fetching bakery reviews for user ${userId}:`, error);
      throw error;
    }
  }
  
  async getBakeryReviewsByBakery(bakeryId) {
    try {
      const response = await apiClient.get(`/bakeryreviews/bakery/${bakeryId}`, true);
      return response;
    } catch (error) {
      console.error(`Error fetching reviews for bakery ${bakeryId}:`, error);
      throw error;
    }
  }

  async createBakeryReview(reviewData) {
    try {
      const response = await apiClient.post('/bakeryreviews/create', reviewData);
      return response;
    } catch (error) {
      console.error('Error creating bakery review:', error);
      throw error;
    }
  }

  async updateBakeryReview(id, reviewData) {
    try {
      const response = await apiClient.patch(`/bakeryreviews/update/${id}`, reviewData);
      return response;
    } catch (error) {
      console.error(`Error updating bakery review ${id}:`, error);
      throw error;
    }
  }

  async deleteBakeryReview(id) {
    try {
      const response = await apiClient.delete(`/bakeryreviews/delete/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting bakery review ${id}:`, error);
      throw error;
    }
  }

  // Product Reviews
  async getAllProductReviews() {
    try {
      const response = await apiClient.get('/productreviews', true);
      return response;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  }

  async getProductReviewsByUser(userId) {
    try {
      const response = await apiClient.get(`/productreviews/user/${userId}`, true);
      return response;
    } catch (error) {
      console.error(`Error fetching product reviews for user ${userId}:`, error);
      throw error;
    }
  }
  
  async getProductReviewsByProduct(productId) {
    try {
      const response = await apiClient.get(`/productreviews/product/${productId}`, true);
      return response;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  }

  async createProductReview(reviewData) {
    try {
      const response = await apiClient.post('/productreviews/create', reviewData);
      return response;
    } catch (error) {
      console.error('Error creating product review:', error);
      throw error;
    }
  }

  async updateProductReview(id, reviewData) {
    try {
      const response = await apiClient.patch(`/productreviews/update/${id}`, reviewData);
      return response;
    } catch (error) {
      console.error(`Error updating product review ${id}:`, error);
      throw error;
    }
  }

  async deleteProductReview(id) {
    try {
      const response = await apiClient.delete(`/productreviews/delete/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting product review ${id}:`, error);
      throw error;
    }
  }

  // Combined review methods for user profile
  async getUserReviews(userId) {
    try {
      // Fetch both types of reviews in parallel
      const [bakeryReviewsResponse, productReviewsResponse] = await Promise.all([
        this.getBakeryReviewsByUser(userId),
        this.getProductReviewsByUser(userId)
      ]);
      
      return {
        bakeryReviews: bakeryReviewsResponse?.bakeryReviews || [],
        productReviews: productReviewsResponse?.productReviews || []
      };
    } catch (error) {
      console.error(`Error fetching user reviews for user ${userId}:`, error);
      throw error;
    }
  }

  // Fetch bakery and product data for reviews where names are missing
  async _enrichReviewsWithDetails(reviews) {
    const enrichedReviews = [...reviews];
    
    // Process the reviews that need enrichment
    const bakeryReviewsToEnrich = enrichedReviews
      .filter(review => review.type === 'bakery' && (!review.itemName || review.itemName === 'Unknown Bakery'))
      .map(review => ({ index: enrichedReviews.indexOf(review), id: review.itemId }));
      
    const productReviewsToEnrich = enrichedReviews
      .filter(review => review.type === 'product' && (!review.itemName || review.itemName === 'Unknown Product'))
      .map(review => ({ index: enrichedReviews.indexOf(review), id: review.itemId }));
    
    // Fetch the missing bakery data
    await Promise.all(
      bakeryReviewsToEnrich.map(async ({ index, id }) => {
        try {
          const bakeryResponse = await apiClient.get(`/bakeries/${id}`, true);
          if (bakeryResponse && bakeryResponse.name) {
            enrichedReviews[index].itemName = bakeryResponse.name;
          }
        } catch (error) {
          console.error(`Error fetching bakery ${id} details:`, error);
        }
      })
    );
    
    // Fetch the missing product data
    await Promise.all(
      productReviewsToEnrich.map(async ({ index, id }) => {
        try {
          const productResponse = await apiClient.get(`/products/${id}`, true);
          if (productResponse && productResponse.name) {
            enrichedReviews[index].itemName = productResponse.name;
            
            // If we have bakery info for the product, add that too
            if (productResponse.bakery && productResponse.bakery.name) {
              enrichedReviews[index].bakeryName = productResponse.bakery.name;
            } else if (productResponse.bakeryId) {
              try {
                const bakeryResponse = await apiClient.get(`/bakeries/${productResponse.bakeryId}`, true);
                if (bakeryResponse && bakeryResponse.name) {
                  enrichedReviews[index].bakeryName = bakeryResponse.name;
                }
              } catch (error) {
                console.error(`Error fetching bakery for product ${id}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching product ${id} details:`, error);
        }
      })
    );
    
    return enrichedReviews;
  }

  // User review statistics
  async getUserReviewStats(userId) {
    try {
      const { bakeryReviews, productReviews } = await this.getUserReviews(userId);
      
      // Calculate statistics
      const totalReviews = bakeryReviews.length + productReviews.length;
      
      // Calculate average rating across all reviews
      let totalRating = 0;
      bakeryReviews.forEach(review => {
        totalRating += review.overallRating || 0;
      });
      
      productReviews.forEach(review => {
        totalRating += review.overallRating || 0;
      });
      
      const averageRating = totalReviews > 0 ? totalRating / totalReviews / 2 : 0; // Convert to 5-star scale
      
      // Get most recent review
      const allReviews = [...bakeryReviews, ...productReviews];
      allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const mostRecentReview = allReviews.length > 0 ? allReviews[0] : null;
      
      return {
        totalReviews,
        bakeryReviews: bakeryReviews.length,
        productReviews: productReviews.length,
        averageRating,
        mostRecentReview
      };
    } catch (error) {
      console.error(`Error calculating user review stats for user ${userId}:`, error);
      throw error;
    }
  }

  // Get recent reviews for a user (limit can be specified)
  async getUserRecentReviews(userId, limit = 5) {
    try {
      const { bakeryReviews, productReviews } = await this.getUserReviews(userId);
      
      // Combine and format reviews
      const allReviews = [
        ...bakeryReviews.map(review => ({
          id: review.id,
          type: 'bakery',
          itemId: review.bakeryId,
          itemName: review.bakery_name || 'Unknown Bakery',
          rating: review.overallRating / 2, // Convert to 5-star scale
          date: review.created_at,
          comment: review.review,
          rawReview: review // Keep the original review for reference
        })),
        ...productReviews.map(review => ({
          id: review.id,
          type: 'product',
          itemId: review.productId,
          itemName: review.product_name || 'Unknown Product',
          rating: review.overallRating / 2, // Convert to 5-star scale
          date: review.created_at,
          comment: review.review,
          rawReview: review // Keep the original review for reference
        }))
      ];
      
      // Sort by date (newest first)
      allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Get the most recent reviews
      const recentReviews = allReviews.slice(0, limit);
      
      // Enrich the recent reviews with full details
      const enrichedReviews = await this._enrichReviewsWithDetails(recentReviews);
      
      return enrichedReviews;
    } catch (error) {
      console.error(`Error fetching recent reviews for user ${userId}:`, error);
      throw error;
    }
  }
  
  // Delete a review of either type
  async deleteReview(reviewId, reviewType) {
    try {
      if (reviewType === 'bakery') {
        return await this.deleteBakeryReview(reviewId);
      } else if (reviewType === 'product') {
        return await this.deleteProductReview(reviewId);
      } else {
        throw new Error(`Unknown review type: ${reviewType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${reviewType} review ${reviewId}:`, error);
      throw error;
    }
  }
}

export default new ReviewService();