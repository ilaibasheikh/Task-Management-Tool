import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { getTasks, type TaskFilters } from '../api/tasks';
import type { TaskItem, TaskPriority, TaskStatus } from '../types/task';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';

export default function TaskListPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({ search: '', status: '', priority: '', category: '' });

  useEffect(() => {
    getTasks(filters).then(setTasks);
  }, [filters]);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>Search, filter, and open task details.</p>
        </div>
        <Link className="primary-link" to="/tasks/new"><Plus size={18} /> New Task</Link>
      </header>
      <div className="filters">
        <label className="search-field"><Search size={18} /><input placeholder="Search tasks" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></label>
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value === '' ? '' : Number(event.target.value) as TaskStatus })}>
          <option value="">All statuses</option>
          <option value="0">Pending</option>
          <option value="1">In Progress</option>
          <option value="2">Completed</option>
        </select>
        <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value === '' ? '' : Number(event.target.value) as TaskPriority })}>
          <option value="">All priorities</option>
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
          <option value="3">Critical</option>
        </select>
        <input placeholder="Category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} />
      </div>
      <div className="task-table">
        {tasks.map((task) => (
          <Link className="task-row" key={task.id} to={`/tasks/${task.id}`}>
            <div>
              <strong>{task.title}</strong>
              <span>{task.category} {task.dueDate ? `• Due ${new Date(task.dueDate).toLocaleDateString()}` : ''}</span>
            </div>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </Link>
        ))}
        {tasks.length === 0 && <p className="empty-state">No tasks match the current filters.</p>}
      </div>
    </section>
  );
}
