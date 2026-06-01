import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Timer } from 'lucide-react';
import { getTaskCounts } from '../api/tasks';
import type { TaskCounts } from '../types/task';

export default function DashboardPage() {
  const [counts, setCounts] = useState<TaskCounts>({ pending: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    getTaskCounts().then(setCounts);
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your task status overview.</p>
        </div>
      </header>
      <div className="metric-grid">
        <article className="metric"><Clock3 /><span>Pending</span><strong>{counts.pending}</strong></article>
        <article className="metric"><Timer /><span>In Progress</span><strong>{counts.inProgress}</strong></article>
        <article className="metric"><CheckCircle2 /><span>Completed</span><strong>{counts.completed}</strong></article>
      </div>
    </section>
  );
}
