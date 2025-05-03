export class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.profilePicture = data.profilePicture;
    this.isAdmin = data.isAdmin || false;
    this.created_at = data.created_at;
  }

  static fromApiResponse(data) {
    return new User(data);
  }

  get fullName() {
    return this.username;
  }

  get initials() {
    return this.username.charAt(0).toUpperCase();
  }

  toApiPayload() {
    return {
      username: this.username,
      email: this.email,
      profile_picture: this.profilePicture, // backend expects snake_case
      is_admin: this.isAdmin
    };
  }
}