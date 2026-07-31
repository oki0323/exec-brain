import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: '💬', label: '相談' },
  { to: '/tasks', icon: '✅', label: 'タスク' },
  { to: '/schedule', icon: '📅', label: '予定' },
  { to: '/reports', icon: '📝', label: '要約' },
  { to: '/settings', icon: '⚙️', label: '設定' },
];

export default function Navigation() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-h)',
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
    }}>
      {NAV_ITEMS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            color: isActive ? 'var(--accent-light)' : 'var(--text2)',
            transition: 'color 0.2s',
          })}
        >
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
