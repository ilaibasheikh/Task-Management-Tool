import { apiRequest } from './client';
import type { TaskCounts, TaskItem, TaskPayload, TaskPriority, TaskStatus } from '../types/task';

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  category?: string;
}

export function getTaskCounts() {
  return apiRequest<TaskCounts>('/tasks/counts');
}

export function getTasks(filters: TaskFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return apiRequest<TaskItem[]>(`/tasks${query ? `?${query}` : ''}`);
}

export function getTask(id: string) {
  return apiRequest<TaskItem>(`/tasks/${id}`);
}

export function createTask(payload: TaskPayload) {
  return apiRequest<TaskItem>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTask(id: string, payload: TaskPayload) {
  return apiRequest<TaskItem>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteTask(id: string) {
  return apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' });
}
