export class BakeryStats {
    constructor(data) {
      this.average_rating = data.average_rating;
      this.review_count = data.review_count;
      this.ratings = {
        overall: data.ratings?.overall || 0,
        service: data.ratings?.service || 0,
        price: data.ratings?.price || 0,
        atmosphere: data.ratings?.atmosphere || 0,
        location: data.ratings?.location || 0
      };
    }
  
    static fromApiResponse(data) {
      return new BakeryStats(data);
    }
  }
  
  export class ProductStats {
    constructor(data) {
      this.average_rating = data.average_rating;
      this.review_count = data.review_count;
      this.ratings = {
        overall: data.ratings?.overall || 0,
        taste: data.ratings?.taste || 0,
        price: data.ratings?.price || 0,
        presentation: data.ratings?.presentation || 0
      };
    }
  
    static fromApiResponse(data) {
      return new ProductStats(data);
    }
  }
  
  export class UserStats {
    constructor(data) {
      this.totalReviews = data.totalReviews;
      this.bakeryReviews = data.bakeryReviews;
      this.productReviews = data.productReviews;
      this.averageRating = data.averageRating;
      this.mostRecentReview = data.mostRecentReview;
    }
  
    static fromApiResponse(data) {
      return new UserStats(data);
    }
  }