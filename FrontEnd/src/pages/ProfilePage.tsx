import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <section className="page compact-page">
      <header className="page-header">
        <div>
          <h1>User Profile</h1>
          <p>Signed-in account details.</p>
        </div>
      </header>
      <div className="profile-panel">
        <span>Full name<strong>{user?.fullName}</strong></span>
        <span>Email<strong>{user?.email}</strong></span>
        <span>Roles<strong>{user?.roles.join(', ')}</strong></span>
        <button className="primary-button" onClick={logout}><LogOut size={18} /> Logout</button>
      </div>
    </section>
  );
}
