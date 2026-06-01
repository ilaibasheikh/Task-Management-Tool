import { useEffect, useMemo, useState } from 'react';
import { Award, CalendarDays, Crown, Flame, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { getTasks } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import type { TaskItem } from '../types/task';

const dayMs = 24 * 60 * 60 * 1000;

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const initials = user?.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = user?.roles.includes('Admin') ?? false;

  useEffect(() => {
    if (!isAdmin) {
      getTasks({}).then(setTasks);
    }
  }, [isAdmin]);

  const profileStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * dayMs);
    const monthAgo = new Date(now.getTime() - 30 * dayMs);
    const completedTasks = tasks.filter((task) => task.status === 2);
    const inProgressTasks = tasks.filter((task) => task.status === 1);
    const datedOpenTasks = tasks.filter((task) => task.dueDate && task.status !== 2);
    const dueSoonTasks = datedOpenTasks.filter((task) => {
      const dueDate = new Date(task.dueDate ?? '');
      return dueDate >= now && dueDate.getTime() - now.getTime() <= 7 * dayMs;
    });
    const recentlyCompleted = completedTasks.filter((task) => new Date(task.updatedAt ?? task.createdAt) >= weekAgo);
    const monthlyCreated = tasks.filter((task) => new Date(task.createdAt) >= monthAgo);
    const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);
    const level = Math.max(1, Math.min(10, 1 + Math.floor(completedTasks.length / 5) + Math.floor(completionRate / 25)));
    const progress = Math.min(100, (completedTasks.length % 5) * 20 + Math.min(20, Math.floor(completionRate / 5)));
    const levelName = level >= 8 ? 'Reliable Finisher' : level >= 5 ? 'Momentum Builder' : level >= 3 ? 'Steady Starter' : 'Getting Started';

    return {
      completedTasks,
      inProgressTasks,
      datedOpenTasks,
      dueSoonTasks,
      recentlyCompleted,
      monthlyCreated,
      completionRate,
      level,
      progress,
      levelName,
    };
  }, [tasks]);

  const badges = [
    {
      earned: profileStats.recentlyCompleted.length >= 3,
      icon: <Flame />,
      label: 'Weekly closer',
      detail: `${profileStats.recentlyCompleted.length} completed this week`,
    },
    {
      earned: profileStats.inProgressTasks.length > 0,
      icon: <Sparkles />,
      label: 'Work in motion',
      detail: `${profileStats.inProgressTasks.length} active tasks`,
    },
    {
      earned: profileStats.completedTasks.length >= 10,
      icon: <ShieldCheck />,
      label: 'Reliable closer',
      detail: `${profileStats.completedTasks.length} lifetime completions`,
    },
    {
      earned: profileStats.datedOpenTasks.length > 0,
      icon: <CalendarDays />,
      label: 'Deadline aware',
      detail: `${profileStats.datedOpenTasks.length} open tasks with dates`,
    },
  ];

  return (
    <section className="page profile-page">
      <header className="profile-hero glass-panel">
        <div className="avatar">{initials}</div>
        <div>
          <span className="eyebrow">Profile</span>
          <h1>{user?.fullName}</h1>
          <p>{user?.email}</p>
        </div>
        <button className="icon-text-button" onClick={logout}><LogOut size={18} /> Logout</button>
      </header>
      {!isAdmin && (
        <div className="profile-grid">
          <section className="content-card level-card">
            <Crown size={24} />
            <span>Productivity level</span>
            <strong>Level {profileStats.level} - {profileStats.levelName}</strong>
            <small>{profileStats.completedTasks.length} completed tasks, {profileStats.completionRate}% completion rate</small>
            <div className="progress-line"><span style={{ width: `${profileStats.progress}%` }} /></div>
          </section>

          <section className="content-card">
            <div className="section-title">
              <h2>Badges</h2>
              <Award size={20} />
            </div>
            <div className="badge-grid">
              {badges.map((badge) => (
                <span className={badge.earned ? '' : 'badge-locked'} key={badge.label}>
                  {badge.icon}
                  <span>
                    <strong>{badge.label}</strong>
                    <small>{badge.detail}</small>
                  </span>
                </span>
              ))}
            </div>
          </section>

          <section className="content-card activity-card">
            <div className="section-title">
              <h2>Activity history</h2>
              <span>{user?.roles.join(', ')}</span>
            </div>
            <ol>
              <li><strong>Completed</strong><span>{profileStats.completedTasks.length} of {tasks.length} tasks are done.</span></li>
              <li><strong>This week</strong><span>{profileStats.recentlyCompleted.length} tasks completed and {profileStats.dueSoonTasks.length} deadlines due soon.</span></li>
              <li><strong>This month</strong><span>{profileStats.monthlyCreated.length} tasks added in the last 30 days.</span></li>
            </ol>
          </section>
        </div>
      )}
      
    </section>
  );
}
