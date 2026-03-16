import { NavLink, useNavigate } from 'react-router-dom'
import { removeToken } from '../utils/token'

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    removeToken()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✂️</div>
        <span className="sidebar-logo-name">Snip</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu</span>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

        <div className="sidebar-divider" />
        <span className="sidebar-section-label">Account</span>

        <button className="sidebar-link" onClick={handleLogout}>
          <span className="sidebar-link-icon">🚪</span>
          Logout
        </button>
      </nav>
    </aside>
  )
}
