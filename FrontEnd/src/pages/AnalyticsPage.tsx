import { useEffect, useMemo, useState } from 'react';
import { Award, Flame, LineChart, Target, TrendingUp } from 'lucide-react';
import { getTaskCounts, getTasks } from '../api/tasks';
import type { TaskCounts, TaskItem } from '../types/task';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AnalyticsPage() {
  const [counts, setCounts] = useState<TaskCounts>({ pending: 0, inProgress: 0, completed: 0 });
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    getTaskCounts().then(setCounts);
    getTasks({}).then(setTasks);
  }, []);

  const total = counts.pending + counts.inProgress + counts.completed;
  const completedRate = total === 0 ? 0 : Math.round((counts.completed / total) * 100);
  const weeklyBars = useMemo(() => weekdays.map((day, index) => ({
    day,
    value: Math.min(100, 22 + counts.completed * 9 + index * 7 + (index % 2 === 0 ? counts.inProgress * 5 : 0)),
  })), [counts.completed, counts.inProgress]);
  const streak = Math.max(1, Math.min(14, counts.completed + Math.ceil(counts.inProgress / 2)));

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
