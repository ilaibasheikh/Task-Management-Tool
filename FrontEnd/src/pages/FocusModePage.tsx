import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { getTasks } from '../api/tasks';
import type { TaskItem } from '../types/task';

const focusSeconds = 25 * 60;

export default function FocusModePage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeTaskId, setActiveTaskId] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(focusSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    getTasks({ status: 1 }).then((items) => {
      setTasks(items);
      setActiveTaskId(items[0]?.id ?? '');
    });
  }, []);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  const activeTask = useMemo(() => tasks.find((task) => task.id === activeTaskId), [activeTaskId, tasks]);
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const progress = Math.round(((focusSeconds - secondsLeft) / focusSeconds) * 100);

  return (
    <section className="page focus-page">
      <div className="focus-shell">
        <div className="focus-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="eyebrow">Focus mode</span>
        <h1>{minutes}:{seconds}</h1>
        <p>One task. One timer. One clean pocket of attention.</p>

        <div className="focus-task glass-panel">
          <Sparkles size={20} />
          <div>
            <span>Current task</span>
            <strong>{activeTask?.title ?? 'Choose an in-progress task'}</strong>
          </div>
        </div>

        <div className="focus-controls">
          <button className="primary-button" onClick={() => setRunning((current) => !current)}>
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button className="icon-text-button" onClick={() => { setRunning(false); setSecondsLeft(focusSeconds); }}>
            <RotateCcw size={18} /> Reset
          </button>
        </div>

        <div className="progress-line focus-progress" aria-label={`${progress}% focus session complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="content-card focus-picker">
        <div className="section-title">
          <h2>In-progress tasks</h2>
          <CheckCircle2 size={20} />
        </div>
        <div className="focus-task-options">
          {tasks.map((task) => (
            <button className={activeTaskId === task.id ? 'active' : ''} key={task.id} onClick={() => setActiveTaskId(task.id)}>
              <strong>{task.title}</strong>
              <span>{task.category}</span>
            </button>
          ))}
          {tasks.length === 0 && <p className="empty-state">Move a task to In Progress to start a focus session.</p>}
        </div>
      </section>
    </section>
  );
}
