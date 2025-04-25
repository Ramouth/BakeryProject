export class User {
    constructor(data) {
      this.id = data.id;
      this.username = data.username;
      this.email = data.email;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.profilePicture = data.profilePicture;
      this.isAdmin = data.isAdmin || false;
      this.created_at = data.created_at;
    }
  
    static fromApiResponse(data) {
      return new User(data);
    }
  
    get fullName() {
      return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
    }
  
    get initials() {
      if (this.firstName && this.lastName) {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
      }
      return this.username.charAt(0).toUpperCase();
    }
  }