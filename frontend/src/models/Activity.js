export class Activity {
    constructor(data) {
      this.id = data.id;
      this.type = data.type; // 'bakery_review', 'product_review', etc
      this.time = data.time;
      this.text = data.text;
      this.userId = data.userId;
      this.username = data.username;
    }
  
    static fromApiResponse(data) {
      return new Activity(data);
    }
  }