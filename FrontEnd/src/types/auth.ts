export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserProfile;
}
