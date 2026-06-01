export type TaskStatus = 0 | 1 | 2;
export type TaskPriority = 0 | 1 | 2 | 3;

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string | null;
  assignedUserId: string;
  assignedUserName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TaskCounts {
  pending: number;
  inProgress: number;
  completed: number;
}

export interface TaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string | null;
  assignedUserId?: string | null;
}
