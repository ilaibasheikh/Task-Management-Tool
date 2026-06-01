import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTask, getTask, updateTask } from '../api/tasks';
import { getUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import type { UserOption } from '../types/auth';
import type { TaskPayload, TaskPriority, TaskStatus } from '../types/task';

const emptyTask: TaskPayload = {
  title: '',
  description: '',
  status: 0,
  priority: 1,
  category: 'General',
  dueDate: null,
  assignedUserId: null,
};

export default function TaskFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const [task, setTask] = useState<TaskPayload>(emptyTask);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      queueMicrotask(() => setTask(emptyTask));
      return;
    }

    getTask(id).then((existing) => setTask({
      title: existing.title,
      description: existing.description,
      status: existing.status,
      priority: existing.priority,
      category: existing.category,
      dueDate: existing.dueDate?.slice(0, 10) ?? null,
      assignedUserId: existing.assignedUserId,
    }));
  }, [id]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    getUsers()
      .then((items) => {
        setUsers(items);
        if (!id && items.length > 0) {
          setTask((current) => ({ ...current, assignedUserId: current.assignedUserId ?? items[0].id }));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load users.'));
  }, [id, isAdmin]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const payload = { ...task, dueDate: task.dueDate || null, assignedUserId: isAdmin ? task.assignedUserId : null };
      const saved = id ? await updateTask(id, payload) : await createTask(payload);
      navigate(`/tasks/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save task.');
    }
  }

  return (
    <section className="page compact-page">
      <header className="page-header">
        <div>
          <h1>{id ? 'Edit Task' : 'New Task'}</h1>
          <p>Set priority, status, category, and due date.</p>
        </div>
      </header>
      <form className="form-stack task-form" onSubmit={submit}>
        <label>Title<input value={task.title} onChange={(event) => setTask({ ...task, title: event.target.value })} required /></label>
        <label>Description<textarea value={task.description} onChange={(event) => setTask({ ...task, description: event.target.value })} rows={5} /></label>
        <div className="form-grid">
          <label>Status<select value={task.status} onChange={(event) => setTask({ ...task, status: Number(event.target.value) as TaskStatus })}><option value="0">Pending</option><option value="1">In Progress</option><option value="2">Completed</option></select></label>
          <label>Priority<select value={task.priority} onChange={(event) => setTask({ ...task, priority: Number(event.target.value) as TaskPriority })}><option value="0">Low</option><option value="1">Medium</option><option value="2">High</option><option value="3">Critical</option></select></label>
          <label>Category<input value={task.category} onChange={(event) => setTask({ ...task, category: event.target.value })} /></label>
          <label>Due date<input type="date" value={task.dueDate ?? ''} onChange={(event) => setTask({ ...task, dueDate: event.target.value })} /></label>
        </div>
        {isAdmin && (
          <label>
            Assigned user
            <select value={task.assignedUserId ?? ''} onChange={(event) => setTask({ ...task, assignedUserId: event.target.value || null })}>
              <option value="">Select a user</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>{item.fullName} ({item.email})</option>
              ))}
            </select>
          </label>
        )}
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button">Save Task</button>
      </form>
    </section>
  );
}
