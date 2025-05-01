export class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.profilePicture = data.profilePicture;
    this.isAdmin = data.isAdmin || false;
    this.created_at = data.created_at;

    // Remove these unless your backend actually sends them
    this.firstName = data.firstName || null;
    this.lastName = data.lastName || null;
  }

  static fromApiResponse(data) {
    return new User(data);
  }

  get fullName() {
    if (this.firstName || this.lastName) {
      return `${this.firstName || ''} ${this.lastName || ''}`.trim();
    }
    return this.username;
  }

  get initials() {
    if (this.firstName && this.lastName) {
      return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }
    return this.username.charAt(0).toUpperCase();
  }
}
