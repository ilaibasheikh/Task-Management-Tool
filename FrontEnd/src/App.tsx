import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, LogOut, Plus, UserCircle } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskFormPage from './pages/TaskFormPage';
import ProfilePage from './pages/ProfilePage';

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
      <aside className="sidebar">
        <div className="brand">
          <ClipboardList size={28} />
          <span>Task Tool</span>
        </div>
        <nav>
          <NavLink to="/" end><LayoutDashboard size={18} /> Dashboard</NavLink>
          <NavLink to="/tasks"><ClipboardList size={18} /> Tasks</NavLink>
          <NavLink to="/tasks/new"><Plus size={18} /> New Task</NavLink>
          <NavLink to="/profile"><UserCircle size={18} /> Profile</NavLink>
        </nav>
        <button className="ghost-button logout" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>
      <main className="main-panel">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/tasks/new" element={<TaskFormPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
