import { Award, CalendarDays, Crown, Flame, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const initials = user?.fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

    const isAdmin = user?.roles.includes('Admin') ?? false;

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
          <strong>Level 4 - Momentum Builder</strong>
          <div className="progress-line"><span style={{ width: '68%' }} /></div>
        </section>

        <section className="content-card">
          <div className="section-title">
            <h2>Badges</h2>
            <Award size={20} />
          </div>
          <div className="badge-grid">
            <span><Flame /> 7 day streak</span>
            <span><Sparkles /> Deep work</span>
            <span><ShieldCheck /> Reliable closer</span>
            <span><CalendarDays /> Deadline aware</span>
          </div>
        </section>

        <section className="content-card activity-card">
          <div className="section-title">
            <h2>Activity history</h2>
            <span>{user?.roles.join(', ')}</span>
          </div>
          <ol>
            <li><strong>Today</strong><span>Reviewed dashboard and planned the next focus block.</span></li>
            <li><strong>This week</strong><span>Kept tasks organized by status and priority.</span></li>
            <li><strong>This month</strong><span>Built a steady rhythm around task completion.</span></li>
          </ol>
        </section>
      </div>
    )}
      
    </section>
  );
}
