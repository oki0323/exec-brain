import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: '⚡', label: 'ホーム' },
  { to: '/tracker', icon: '📊', label: 'トラッカー' },
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
            padding: '8px 20px',
            borderRadius: 'var(--radius-sm)',
            color: isActive ? 'var(--accent)' : 'var(--text2)',
            transition: 'color 0.2s',
          })}
        >
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
