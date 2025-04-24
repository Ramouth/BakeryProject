export class Product {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.bakeryId = data.bakeryId;
      this.category = data.category;
      this.imageUrl = data.imageUrl;
      this.bakery = data.bakery;
      this.rating = data.rating;
      this.average_rating = data.average_rating;
    }
  
    static fromApiResponse(data) {
      return new Product(data);
    }
  }
  