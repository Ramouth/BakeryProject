export class Category {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.filter = data.filter;
      this.products = data.products || [];
    }
  
    static fromApiResponse(data) {
      return new Category(data);
    }
  }