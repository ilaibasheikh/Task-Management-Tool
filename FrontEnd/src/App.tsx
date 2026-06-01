import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { BarChart3, Brain, ClipboardList, LayoutDashboard, LogOut, Plus, UserCircle } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskFormPage from './pages/TaskFormPage';
import ProfilePage from './pages/ProfilePage';
import FocusModePage from './pages/FocusModePage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <main className="center-screen">Loading workspace...</main>;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand ">
          <span className="brand-mark"><ClipboardList size={29} /></span>
          <div>
            <strong>TaskFlow</strong>
            <span>Plan with calm momentum</span>
          </div>
        </div>
        <button className="icon-text-button" onClick={logout}><LogOut size={18} /> Logout</button>
      </header>

      <main className="main-panel">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/tasks/new" element={<TaskFormPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
          <Route path="/focus" element={<FocusModePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NavLink className="floating-action" to="/tasks/new" aria-label="Quick add task"><Plus size={26} /></NavLink>

      <nav className="bottom-tabs" aria-label="Primary navigation">
        <NavLink to="/" end><LayoutDashboard size={20} /><span>Home</span></NavLink>
        <NavLink to="/tasks"><ClipboardList size={20} /><span>Tasks</span></NavLink>
        <NavLink to="/focus"><Brain size={20} /><span>Focus</span></NavLink>
        <NavLink to="/analytics"><BarChart3 size={20} /><span>Stats</span></NavLink>
        <NavLink to="/profile"><UserCircle size={20} /><span>Profile</span></NavLink>
      </nav>

      <aside className="desktop-rail">
        <nav aria-label="Desktop navigation">
          <NavLink to="/" end><LayoutDashboard size={20} /><span>Home</span></NavLink>
          <NavLink to="/tasks"><ClipboardList size={20} /><span>Tasks</span></NavLink>
          <NavLink to="/focus"><Brain size={20} /><span>Focus</span></NavLink>
          <NavLink to="/analytics"><BarChart3 size={20} /><span>Analytics</span></NavLink>
          <NavLink to="/profile"><UserCircle size={20} /><span>Profile</span></NavLink>
        </nav>
      </aside>
    </div>
  );
}

export default App;
