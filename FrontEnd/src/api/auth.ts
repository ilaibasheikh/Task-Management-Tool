import { apiRequest } from './client';
import type { AuthResponse, UserProfile } from '../types/auth';

export function register(fullName: string, email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getProfile() {
  return apiRequest<UserProfile>('/auth/me');
}
