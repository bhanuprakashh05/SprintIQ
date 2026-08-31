import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

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
  UserPlus,
  X,
} from 'lucide-react'

import '../App.css'

function Settings() {
  const navigate = useNavigate()

  const [user] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  )

  const isAdmin = user.role === 'ADMIN'

  // ==========================================
  // CREATE MEMBER
  // ==========================================

  const [showCreateMember, setShowCreateMember] =
    useState(false)

  const [creatingMember, setCreatingMember] =
    useState(false)

  const [memberError, setMemberError] =
    useState('')

  const [memberSuccess, setMemberSuccess] =
    useState('')

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // ==========================================
  // CREATE NEW MEMBER
  // ==========================================

  const handleCreateMember = async (event) => {
    event.preventDefault()

    setMemberError('')
    setMemberSuccess('')

    if (!memberForm.name.trim()) {
      setMemberError('Name is required')
      return
    }

    if (!memberForm.email.trim()) {
      setMemberError('Email is required')
      return
    }

    if (!memberForm.password) {
      setMemberError('Password is required')
      return
    }

    if (memberForm.password.length < 6) {
      setMemberError(
        'Password must contain at least 6 characters'
      )
      return
    }

    try {
      setCreatingMember(true)

      const token = localStorage.getItem('token')

      await axios.post(
        'http://localhost:8080/api/users/members',
        {
          name: memberForm.name.trim(),
          email: memberForm.email.trim(),
          password: memberForm.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setMemberSuccess(
        'Member created successfully.'
      )

      setMemberForm({
        name: '',
        email: '',
        password: '',
      })

    } catch (error) {
      console.error(
        'Create member error:',
        error
      )

      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }

      if (error.response?.status === 403) {
        setMemberError(
          'Only ADMIN can create members.'
        )
        return
      }

      setMemberError(
        error.response?.data?.message ||
        'Unable to create member.'
      )

    } finally {
      setCreatingMember(false)
    }
  }

  // ==========================================
  // OPEN CREATE MEMBER FORM
  // ==========================================

  const openCreateMember = () => {
    setShowCreateMember(true)
    setMemberError('')
    setMemberSuccess('')
  }

  // ==========================================
  // CLOSE CREATE MEMBER FORM
  // ==========================================

  const closeCreateMember = () => {
    setShowCreateMember(false)

    setMemberError('')
    setMemberSuccess('')

    setMemberForm({
      name: '',
      email: '',
      password: '',
    })
  }

  return (
    <div className="dashboard-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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

          <Link
            to="/dashboard"
            className="nav-item"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/projects"
            className="nav-item"
          >
            <FolderKanban size={20} />
            <span>Projects</span>
          </Link>

          <Link
            to="/sprints"
            className="nav-item"
          >
            <CalendarDays size={20} />
            <span>Sprints</span>
          </Link>

          <Link
            to="/tasks"
            className="nav-item"
          >
            <ListTodo size={20} />
            <span>Tasks</span>
          </Link>

          <Link
            to="/ai-insights"
            className="nav-item"
          >
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

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="topbar">

          <div>
            <h1>Settings</h1>

            <p>
              Manage your SprintIQ account
            </p>
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

        {/* ===================================================
            SETTINGS CONTENT
        =================================================== */}

        <section className="settings-content">

          <span className="eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h2>Profile</h2>

          <p className="settings-description">
            View your SprintIQ account information.
          </p>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <div className="settings-card">

            <div className="settings-card-header">

              <div className="settings-card-icon">
                <User size={22} />
              </div>

              <div>
                <h3>
                  Personal Information
                </h3>

                <p>
                  Your account details
                </p>
              </div>

              {/* ADMIN ONLY - CREATE MEMBER ICON */}

              {isAdmin && (
                <button
                  type="button"
                  onClick={openCreateMember}
                  title="Create new member"
                  style={{
                    marginLeft: 'auto',
                    border: 'none',
                    background: '#eef2ff',
                    color: '#4f46e5',
                    borderRadius: '8px',
                    padding: '9px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserPlus size={19} />
                </button>
              )}

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

          {/* =================================================
              CREATE NEW MEMBER
              ADMIN ONLY
          ================================================= */}

          {isAdmin && showCreateMember && (

            <div className="settings-card">

              {/* CREATE MEMBER HEADER */}

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <UserPlus size={22} />
                </div>

                <div>

                  <h3>
                    Create New Member
                  </h3>

                  <p>
                    Create a MEMBER account for SprintIQ
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeCreateMember}
                  title="Close"
                  style={{
                    marginLeft: 'auto',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={20} />
                </button>

              </div>

              {/* CREATE MEMBER FORM */}

              <form
                onSubmit={handleCreateMember}
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >

                {/* NAME */}

                <div className="settings-field">

                  <div className="settings-field-icon">
                    <User size={18} />
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >

                    <span>
                      Name
                    </span>

                    <input
                      type="text"
                      value={memberForm.name}
                      onChange={(event) =>
                        setMemberForm({
                          ...memberForm,
                          name: event.target.value,
                        })
                      }
                      placeholder="Enter member name"
                      style={{
                        width: '100%',
                        marginTop: '6px',
                        padding: '10px',
                        border:
                          '1px solid #cbd5e1',
                        borderRadius: '7px',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                      }}
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="settings-field">

                  <div className="settings-field-icon">
                    <Mail size={18} />
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >

                    <span>
                      Email
                    </span>

                    <input
                      type="email"
                      value={memberForm.email}
                      onChange={(event) =>
                        setMemberForm({
                          ...memberForm,
                          email: event.target.value,
                        })
                      }
                      placeholder="Enter member email"
                      style={{
                        width: '100%',
                        marginTop: '6px',
                        padding: '10px',
                        border:
                          '1px solid #cbd5e1',
                        borderRadius: '7px',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                      }}
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div className="settings-field">

                  <div className="settings-field-icon">
                    <Shield size={18} />
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >

                    <span>
                      Password
                    </span>

                    <input
                      type="password"
                      value={memberForm.password}
                      onChange={(event) =>
                        setMemberForm({
                          ...memberForm,
                          password: event.target.value,
                        })
                      }
                      placeholder="Minimum 6 characters"
                      style={{
                        width: '100%',
                        marginTop: '6px',
                        padding: '10px',
                        border:
                          '1px solid #cbd5e1',
                        borderRadius: '7px',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                      }}
                    />

                  </div>

                </div>

                {/* ERROR */}

                {memberError && (

                  <p
                    style={{
                      color: '#dc2626',
                      fontSize: '13px',
                      margin: '0',
                    }}
                  >
                    {memberError}
                  </p>

                )}

                {/* SUCCESS */}

                {memberSuccess && (

                  <p
                    style={{
                      color: '#16a34a',
                      fontSize: '13px',
                      margin: '0',
                    }}
                  >
                    {memberSuccess}
                  </p>

                )}

                {/* CREATE BUTTON */}

                <button
                  type="submit"
                  disabled={creatingMember}
                  style={{
                    alignSelf: 'flex-start',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    background:
                      creatingMember
                        ? '#a5b4fc'
                        : '#4f46e5',
                    color: 'white',
                    fontWeight: '600',
                    cursor:
                      creatingMember
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {creatingMember
                    ? 'Creating...'
                    : 'Create Member'}
                </button>

              </form>

            </div>

          )}

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="settings-card">

            <div className="settings-card-header">

              <div className="settings-card-icon">
                <Shield size={22} />
              </div>

              <div>

                <h3>
                  Security
                </h3>

                <p>
                  Your SprintIQ session
                </p>

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