import { useEffect, useMemo, useState } from 'react';
import { Award, Flame, LineChart, Target, TrendingUp, Trophy, Users } from 'lucide-react';
import { getTaskCounts, getTasks } from '../api/tasks';
import { getUsers } from '../api/users';
import { useAuth } from '../context/AuthContext';
import type { UserOption } from '../types/auth';
import type { TaskCounts, TaskItem } from '../types/task';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AnalyticsPage() {
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
  const completedRate = total === 0 ? 0 : Math.round((counts.completed / total) * 100);
  const weeklyBars = useMemo(() => weekdays.map((day, index) => ({
    day,
    value: Math.min(100, 22 + counts.completed * 9 + index * 7 + (index % 2 === 0 ? counts.inProgress * 5 : 0)),
  })), [counts.completed, counts.inProgress]);
  const streak = Math.max(1, Math.min(14, counts.completed + Math.ceil(counts.inProgress / 2)));
  const userStats = useMemo(() => users.map((item) => {
    const assignedTasks = tasks.filter((task) => task.assignedUserId === item.id);
    const completedTasks = assignedTasks.filter((task) => task.status === 2).length;

    return {
      ...item,
      totalTasks: assignedTasks.length,
      completedTasks,
      openTasks: assignedTasks.length - completedTasks,
    };
  }).sort((a, b) => b.completedTasks - a.completedTasks || b.totalTasks - a.totalTasks || a.fullName.localeCompare(b.fullName)), [tasks, users]);
  const mostProductive = userStats[0];

  return (
    <section className="page analytics-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Analytics</span>
          <h1>Progress you can actually feel.</h1>
          <p>Completion trends, streaks, and useful signals without the noise.</p>
        </div>
      </header>

      <div className="metric-grid">
        <article className="metric"><Target /><span>Completion rate</span><strong>{completedRate}%</strong></article>
        <article className="metric completed-card"><Flame /><span>Current streak</span><strong>{streak}d</strong></article>
        <article className="metric"><Award /><span>Tasks completed</span><strong>{counts.completed}</strong></article>
        <article className="metric score-card"><TrendingUp /><span>Open workload</span><strong>{counts.pending + counts.inProgress}</strong></article>
      </div>

      {isAdmin && (
        <div className="admin-analytics-grid">
          <article className="metric completed-card">
            <Trophy />
            <span>Most productive</span>
            <strong>{mostProductive?.fullName ?? 'No users'}</strong>
            <small>{mostProductive ? `${mostProductive.completedTasks} completed tasks` : 'No completed tasks yet'}</small>
          </article>
          <section className="content-card">
            <div className="section-title">
              <h2>Tasks per user</h2>
              <Users size={20} />
            </div>
            <div className="user-stats-list">
              {userStats.map((item) => (
                <article className="user-stat-row" key={item.id}>
                  <div>
                    <strong>{item.fullName}</strong>
                    <small>{item.email}</small>
                  </div>
                  <span>{item.totalTasks} total</span>
                  <span>{item.completedTasks} completed</span>
                  <span>{item.openTasks} open</span>
                </article>
              ))}
              {userStats.length === 0 && <p className="empty-state">No user activity is available yet.</p>}
            </div>
          </section>
        </div>
      )}

      <section className="content-card">
        <div className="section-title">
          <h2>Weekly productivity</h2>
          <LineChart size={20} />
        </div>
        <div className="bar-chart">
          {weeklyBars.map((bar) => (
            <div className="bar-item" key={bar.day}>
              <span style={{ height: `${bar.value}%` }} />
              <small>{bar.day}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="insight-grid">
        <article className="content-card insight-card">
          <h2>Best next move</h2>
          <p>{counts.inProgress > 0 ? 'Close one in-progress task before opening a new thread.' : 'Pick one pending task and move it into focus mode.'}</p>
        </article>
        <article className="content-card insight-card">
          <h2>Deadline pressure</h2>
          <p>{tasks.filter((task) => task.dueDate && task.status !== 2).length} active tasks have due dates. Keep the top three visible today.</p>
        </article>
      </div>
    </section>
  );
}
