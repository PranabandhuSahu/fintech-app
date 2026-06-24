import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = () => {
    logout()
    toast.success('You have been logged out.')
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="brand">
          <Logo size={38} />
          <span className="brand-name">NovaBank</span>
        </Link>
        {isAuthenticated && (
          <nav className="navbar-actions">
            <NavLink to="/dashboard" className="nav-link">Accounts</NavLink>
            <NavLink to="/transfer" className="nav-link">Transfer</NavLink>
            <NavLink to="/profile" className="nav-link">Profile</NavLink>
            <span className="navbar-user">Hi, {user?.fullName || user?.username}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
