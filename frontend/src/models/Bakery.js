export class Bakery {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.zipCode = data.zipCode;
      this.streetName = data.streetName;
      this.streetNumber = data.streetNumber;
      this.imageUrl = data.imageUrl;
      this.websiteUrl = data.websiteUrl;
      this.average_rating = data.average_rating;
      this.review_count = data.review_count;
      this.ratings = data.ratings;
    }
  
    static fromApiResponse(data) {
      return new Bakery(data);
    }
  
    get address() {
      const parts = [];
      if (this.streetName) parts.push(this.streetName);
      if (this.streetNumber) parts.push(this.streetNumber);
      if (this.zipCode) parts.push(this.zipCode);
      return parts.join(' ');
    }
  }