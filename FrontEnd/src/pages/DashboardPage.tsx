import { type CSSProperties, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Clock3, Timer, TrendingUp, Users } from 'lucide-react';
import { ClipboardList, Plus } from 'lucide-react';
import { getTaskCounts, getTasks } from '../api/tasks';
import { getUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import type { UserOption } from '../types/auth';
import type { TaskCounts, TaskItem } from '../types/task';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const [counts, setCounts] = useState<TaskCounts>({ pending: 0, inProgress: 0, completed: 0 });
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  useEffect(() => {
    getTaskCounts().then(setCounts);
    getTasks({}).then(setTasks);
    if (isAdmin) {
      getUsers().then(setUsers);
    }
  }, [isAdmin]);

  const total = counts.pending + counts.inProgress + counts.completed;
  const completion = total === 0 ? 0 : Math.round((counts.completed / total) * 100);
  const today = new Date().toDateString();
  const todaysTasks = tasks.filter((task) => task.dueDate && new Date(task.dueDate).toDateString() === today).slice(0, 4);
  const upcoming = tasks
    .filter((task) => task.dueDate && task.status !== 2)
    .sort((a, b) => new Date(a.dueDate ?? '').getTime() - new Date(b.dueDate ?? '').getTime())
    .slice(0, 4);
  const productivityScore = Math.min(100, completion + counts.inProgress * 8 + (counts.completed > 0 ? 10 : 0));
  const tasksByUser = users.map((item) => ({
    ...item,
    taskCount: tasks.filter((task) => task.assignedUserId === item.id).length,
  }));

  return (
    <section className="page home-page">
      <header className="hero-panel glass-panel">

        <div>
          <div className="brand ">
           <span className="brand-mark">
  <ClipboardList size={29} />
</span>
            <span className="eyebrow">TaskFlow</span>

          </div>


          <h1>Good to see you, {user?.fullName?.split(' ')[0] ?? 'there'}.</h1>
          <p>Your workspace is tuned for steady progress, clear priorities, and one focused next step.</p>
          <Link className="primary-link soft-glow" to="/tasks/new"><Plus size={20} />Quick add task</Link>
        </div>
        <div className="progress-ring" style={{ '--progress': completion } as CSSProperties}>
  <svg viewBox="0 0 120 120" aria-label={`${completion}% complete`}>
    <circle className="ring-track" cx="60" cy="60" r="50" />
    <circle className="ring-value" cx="60" cy="60" r="50" pathLength="100" />
  </svg>

  <div className="progress-text">
    <strong>{completion}%</strong>
    <span>Daily Progress</span>
  </div>
</div>
      </header>

      <div className="metric-grid">
        <article className="metric"><Clock3 /><span>Pending</span><strong>{counts.pending}</strong></article>
        <article className="metric"><Timer /><span>In Progress</span><strong>{counts.inProgress}</strong></article>
        <article className="metric completed-card"><CheckCircle2 /><span>Completed</span><strong>{counts.completed}</strong></article>
        <article className="metric score-card"><TrendingUp /><span>Productivity score</span><strong>{productivityScore}</strong></article>
      </div>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="section-title">
            <h2>Today's tasks</h2>
            <span>{todaysTasks.length} due today</span>
          </div>
          <div className="mini-task-list">
            {(todaysTasks.length ? todaysTasks : tasks.slice(0, 4)).map((task) => (
              <Link className="mini-task" to={`/tasks/${task.id}`} key={task.id}>
                <span className="task-dot" />
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.category}</small>
                </div>
                <StatusBadge status={task.status} />
              </Link>
            ))}
            {tasks.length === 0 && <p className="empty-state">Create your first task and start the streak.</p>}
          </div>
        </section>

        <section className="content-card">
          <div className="section-title">
            <h2>Upcoming deadlines</h2>
            <CalendarClock size={20} />
          </div>
          <div className="deadline-list">
            {upcoming.map((task) => (
              <Link to={`/tasks/${task.id}`} className="deadline-item" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</small>
                </div>
                <PriorityBadge priority={task.priority} />
              </Link>
            ))}
            {upcoming.length === 0 && <p className="empty-state">No deadlines are pressing right now.</p>}
          </div>
        </section>
      </div>

      {isAdmin && (
        <section className="content-card">
          <div className="section-title">
            <h2>Users</h2>
            <Users size={20} />
          </div>
          <div className="user-list">
            {tasksByUser.map((item) => (
              <article className="user-row" key={item.id}>
                <span className="avatar small-avatar">{item.fullName.charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{item.fullName}</strong>
                  <small>{item.email}</small>
                </div>
                <span>{item.taskCount} tasks</span>
              </article>
            ))}
            {users.length === 0 && <p className="empty-state">No users are available yet.</p>}
          </div>
        </section>
      )}
    </section>
  );
}
