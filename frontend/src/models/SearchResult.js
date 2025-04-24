export class SearchResult {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.type = data.type; // 'bakery' or 'product'
      this.address = data.address;
      this.bakeryName = data.bakeryName; // For products
      this.rating = data.rating;
      this.imageUrl = data.imageUrl;
    }
  
    static fromApiResponse(data) {
      return new SearchResult(data);
    }
  }