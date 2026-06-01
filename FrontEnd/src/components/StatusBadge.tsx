import type { TaskPriority, TaskStatus } from '../types/task';

export const statusLabels: Record<TaskStatus, string> = {
  0: 'Pending',
  1: 'In Progress',
  2: 'Completed',
};

export const priorityLabels: Record<TaskPriority, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
  3: 'Critical',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`badge status-${status}`}>{statusLabels[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={`badge priority-${priority}`}>{priorityLabels[priority]}</span>;
}
