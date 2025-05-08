export class Review {
    constructor(data) {
      this.id = data.id;
      this.review = data.review;
      this.overallRating = data.overallRating;
      this.userId = data.userId;
      this.created_at = data.created_at;
      
      // We see that username is undefined but userId exists
      // Get the username from the user object or generate one based on userId
      if (data.user && data.user.username) {
        this.username = data.user.username;
      } else if (data.userId) {
        // If we have a userId, use it to generate a display name
        this.username = `User ${data.userId}`;
      } else {
        this.username = 'Anonymous';
      }
    }
    
    static fromApiResponse(data) {
      return new Review(data);
    }
  }
  
  export class BakeryReview extends Review {
    constructor(data) {
      super(data);
      this.serviceRating = data.serviceRating;
      this.priceRating = data.priceRating;
      this.atmosphereRating = data.atmosphereRating;
      this.locationRating = data.locationRating;
      this.bakeryId = data.bakeryId;
      this.bakery_name = data.bakery_name;
    }
  }
  
  export class ProductReview extends Review {
    constructor(data) {
      super(data);
      this.tasteRating = data.tasteRating;
      this.priceRating = data.priceRating;
      this.presentationRating = data.presentationRating;
      this.productId = data.productId;
      this.product_name = data.product_name;
    }
  }