export class User {
  constructor({
    id,
    username,
    email,
    password = null,
    profilePicture,
    isAdmin = false,
    created_at,
    updated_at
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.profilePicture = profilePicture;
    this.isAdmin = isAdmin;
    this.createdAt = created_at ? new Date(created_at) : null;
    this.updatedAt = updated_at ? new Date(updated_at) : null;
  }

  static fromApiResponse(raw) {
    return new User({
      id: raw.id,
      username: raw.username,
      email: raw.email,
      // raw.password won't be returned, but included for completeness
      password: raw.password ?? null,
      // Accept both camelCase and snake_case from backend
      profilePicture: raw.profilePicture ?? raw.profile_picture,
      isAdmin: raw.isAdmin ?? raw.is_admin,
      created_at: raw.created_at ?? raw.createdAt,
      updated_at: raw.updated_at ?? raw.updatedAt
    });
  }

  get fullName() {
    return this.username;
  }

  get initials() {
    return this.username.charAt(0).toUpperCase();
  }

  toApiPayload() {
    const payload = {
      username: this.username,
      email: this.email,
      // Emit snake_case fields for the Flask backend
      profile_picture: this.profilePicture,
      is_admin: this.isAdmin
    };

    // Include password when available (login or registration flows)
    if (this.password) {
      payload.password = this.password;
    }

    return payload;
  }
}
