export class Review {
    constructor(data) {
      this.id = data.id;
      this.review = data.review;
      this.overallRating = data.overallRating;
      this.userId = data.userId;
      this.username = data.username;
      this.created_at = data.created_at;
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