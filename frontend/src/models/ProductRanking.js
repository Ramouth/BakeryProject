export class ProductRanking {
    constructor(data) {
      this.rank = data.rank;
      this.productId = data.productId;
      this.bakeryId = data.bakeryId;
      this.bakeryName = data.bakeryName;
      this.address = data.address;
      this.topReview = data.topReview;
      this.rating = data.rating;
      this.reviewCount = data.reviewCount;
      this.image = data.image;
    }
  
    static fromApiResponse(data) {
      return new ProductRanking(data);
    }
  }