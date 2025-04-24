export class Notification {
    constructor(data) {
      this.id = data.id;
      this.message = data.message;
      this.type = data.type; // 'success', 'error', 'warning', 'info'
      this.duration = data.duration;
      this.isVisible = data.isVisible;
    }
  
    static fromApiResponse(data) {
      return new Notification(data);
    }
  }