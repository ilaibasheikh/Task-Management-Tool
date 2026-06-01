import { apiRequest } from './client';
import type { UserOption } from '../types/auth';

export function getUsers() {
  return apiRequest<UserOption[]>('/users');
}
