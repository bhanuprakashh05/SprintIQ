import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ListTodo,
  BrainCircuit,
  Settings as SettingsIcon,
  LogOut,
  User,
  Mail,
  Shield,
} from 'lucide-react'

import '../App.css'

function Settings() {
  const navigate = useNavigate()

  const [user] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  )

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <BrainCircuit size={26} />
          </div>

          <div>
            <h2>SprintIQ</h2>
            <span>Agile Intelligence</span>
          </div>

        </div>

        <nav className="nav-menu">

          <Link to="/dashboard" className="nav-item">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link to="/projects" className="nav-item">
            <FolderKanban size={20} />
            <span>Projects</span>
          </Link>

          <Link to="/sprints" className="nav-item">
            <CalendarDays size={20} />
            <span>Sprints</span>
          </Link>

          <Link to="/tasks" className="nav-item">
            <ListTodo size={20} />
            <span>Tasks</span>
          </Link>

          <Link to="/ai-insights" className="nav-item">
            <BrainCircuit size={20} />
            <span>AI Insights</span>
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <Link
            to="/settings"
            className="nav-item active"
          >
            <SettingsIcon size={20} />
            <span>Settings</span>
          </Link>

          <button
            type="button"
            className="nav-item logout-button"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Settings</h1>
            <p>Manage your SprintIQ account</p>
          </div>

          <div className="user-profile">

            <div className="avatar">
              {(user.name || 'B')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user.name || 'User'}
              </strong>

              <span>
                {user.role || 'Member'}
              </span>
            </div>

          </div>

        </header>

        <section className="settings-content">

          <span className="eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h2>Profile</h2>

          <p className="settings-description">
            View your SprintIQ account information.
          </p>

          <div className="settings-card">

            <div className="settings-card-header">

              <div className="settings-card-icon">
                <User size={22} />
              </div>

              <div>
                <h3>Personal Information</h3>
                <p>Your account details</p>
              </div>

            </div>

            <div className="settings-fields">

              <div className="settings-field">

                <div className="settings-field-icon">
                  <User size={18} />
                </div>

                <div>
                  <span>Name</span>
                  <strong>
                    {user.name || 'Not available'}
                  </strong>
                </div>

              </div>

              <div className="settings-field">

                <div className="settings-field-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {user.email || 'Not available'}
                  </strong>
                </div>

              </div>

              <div className="settings-field">

                <div className="settings-field-icon">
                  <Shield size={18} />
                </div>

                <div>
                  <span>Role</span>
                  <strong>
                    {user.role || 'MEMBER'}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          <div className="settings-card">

            <div className="settings-card-header">

              <div className="settings-card-icon">
                <Shield size={22} />
              </div>

              <div>
                <h3>Security</h3>
                <p>Your SprintIQ session</p>
              </div>

            </div>

            <div className="security-info">

              <div>
                <strong>
                  Authentication
                </strong>

                <p>
                  Your account is protected using
                  JWT-based authentication.
                </p>
              </div>

              <span className="security-status">
                Active
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}

export default Settings