import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { deleteTask, getTask } from '../api/tasks';
import type { TaskItem } from '../types/task';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskItem | null>(null);

  useEffect(() => {
    if (id) {
      getTask(id).then(setTask);
    }
  }, [id]);

  async function removeTask() {
    if (!id || !confirm('Delete this task?')) {
      return;
    }

    await deleteTask(id);
    navigate('/tasks');
  }

  if (!task) {
    return <section className="page">Loading task...</section>;
  }

  return (
    <section className="page detail-page">
      <header className="page-header">
        <div>
          <h1>{task.title}</h1>
          <p>{task.category}</p>
        </div>
        <div className="button-row">
          <Link className="secondary-link" to={`/tasks/${task.id}/edit`}><Edit size={18} /> Edit</Link>
          <button className="danger-button" onClick={removeTask}><Trash2 size={18} /> Delete</button>
        </div>
      </header>
      <div className="detail-grid">
        <span>Status <StatusBadge status={task.status} /></span>
        <span>Priority <PriorityBadge priority={task.priority} /></span>
        <span>Assigned to <strong>{task.assignedUserName ?? task.assignedUserId}</strong></span>
        <span>Due date <strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</strong></span>
      </div>
      <p className="description">{task.description || 'No description provided.'}</p>
    </section>
  );
}
