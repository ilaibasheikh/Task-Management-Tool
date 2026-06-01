import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GripVertical, Plus, Search } from 'lucide-react';
import { getTasks, updateTask, type TaskFilters } from '../api/tasks';
import type { TaskItem, TaskPriority, TaskStatus } from '../types/task';
import { PriorityBadge, statusLabels } from '../components/StatusBadge';

const columns: Array<{ status: TaskStatus; label: string; hint: string }> = [
  { status: 0, label: 'Pending', hint: 'Ready to start' },
  { status: 1, label: 'In Progress', hint: 'Keep momentum' },
  { status: 2, label: 'Completed', hint: 'Wins banked' },
];

export default function TaskListPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({ search: '', status: '', priority: '', category: '' });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    getTasks(filters).then(setTasks);
  }, [filters]);

  async function moveTask(taskId: string, status: TaskStatus) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) {
      setDraggedTaskId(null);
      return;
    }

    setTasks((current) => current.map((item) => item.id === taskId ? { ...item, status } : item));
    setDraggedTaskId(null);
    await updateTask(taskId, {
      title: task.title,
      description: task.description,
      status,
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate,
      assignedUserId: task.assignedUserId,
    });
  }

  function progressFor(status: TaskStatus) {
    if (status === 2) {
      return 100;
    }
    if (status === 1) {
      return 58;
    }
    return 18;
  }

  return (
    <section className="page tasks-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">TaskFlow</span>
          <h1>Organize the work by priority.</h1>
          <p>Drag cards across columns, filter quickly, and keep progress visible.</p>
        </div>
        <Link className="primary-link" to="/tasks/new"><Plus size={18} /> New Task</Link>
      </header>

      <div className="filters glass-panel">
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

      <div className="kanban-board">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);

          return (
            <section
              className={`kanban-column status-column-${column.status}`}
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedTaskId) {
                  moveTask(draggedTaskId, column.status);
                }
              }}
            >
              <div className="kanban-heading">
                <div>
                  <h2>{column.label}</h2>
                  <span>{column.hint}</span>
                </div>
                <strong>{columnTasks.length}</strong>
              </div>

              <div className="task-card-list">
                {columnTasks.map((task) => (
                  <article
                    className={`task-card ${task.status === 2 ? 'task-card-complete' : ''}`}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    key={task.id}
                  >
                    <div className="task-card-top">
                      <button className="drag-handle" type="button" aria-label={`Drag ${task.title}`}><GripVertical size={18} /></button>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <Link to={`/tasks/${task.id}`} className="task-card-link">
                      <h3>{task.title}</h3>
                      <p>{task.description || 'No description added yet.'}</p>
                    </Link>
                    <div className="task-tags">
                      <span>{task.category}</span>
                      <span>{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</span>
                    </div>
                    <div className="progress-line" aria-label={`${statusLabels[task.status]} progress`}>
                      <span style={{ width: `${progressFor(task.status)}%` }} />
                    </div>
                  </article>
                ))}
                {columnTasks.length === 0 && <p className="empty-state compact">Drop tasks here.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
