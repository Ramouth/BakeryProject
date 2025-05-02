export class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.bakeryId = data.bakeryId;
    this.category = data.category;
    this.categoryId = data.categoryId;
    this.subcategory = data.subcategory;  
    this.subcategoryId = data.subcategoryId;  
    this.imageUrl = data.imageUrl;
    this.bakery = data.bakery;
    this.rating = data.rating;
    this.average_rating = data.average_rating;
    this.description = data.description || null;
  }

  static fromApiResponse(data) {
    return new Product(data);
  }
}