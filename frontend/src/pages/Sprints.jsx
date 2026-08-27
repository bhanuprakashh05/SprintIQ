import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ListTodo,
  BrainCircuit,
  Settings,
  LogOut,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import '../App.css'

function Sprints() {
  const navigate = useNavigate()

  const [user, setUser] = useState({})
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    projectId: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    const storedUser = JSON.parse(
      localStorage.getItem('user') || '{}'
    )

    setUser(storedUser)

    fetchSprints()
  }, [navigate])

  const fetchSprints = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await axios.get(
        'http://localhost:8080/api/sprints',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSprints(response.data)

    } catch (error) {
      console.error('Sprints API error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        setError('Unable to load sprints')
      }

    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  const handleSprintClick = (sprint) => {
    navigate(
      `/dashboard?sprintId=${sprint.id}&sprintName=${encodeURIComponent(
        sprint.name
      )}`
    )
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCreateSprint = async (event) => {
    event.preventDefault()

    setFormError('')

    if (!formData.name.trim()) {
      setFormError('Sprint name is required')
      return
    }

    if (!formData.startDate) {
      setFormError('Start date is required')
      return
    }

    if (!formData.endDate) {
      setFormError('End date is required')
      return
    }

    if (!formData.projectId) {
      setFormError('Project ID is required')
      return
    }

    if (formData.endDate < formData.startDate) {
      setFormError(
        'End date cannot be before start date'
      )
      return
    }

    try {
      setCreating(true)

      const token = localStorage.getItem('token')

      const response = await axios.post(
        'http://localhost:8080/api/sprints',
        {
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
          projectId: Number(formData.projectId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setSprints((current) => [
        ...current,
        response.data,
      ])

      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
        projectId: '',
      })

      setShowCreateForm(false)

    } catch (error) {
      console.error('Create sprint error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else if (error.response?.data?.message) {
        setFormError(error.response.data.message)
      } else {
        setFormError(
          'Unable to create sprint. Make sure the Project ID exists.'
        )
      }

    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (sprintId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this sprint?'
    )

    if (!confirmed) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      await axios.delete(
        `http://localhost:8080/api/sprints/${sprintId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSprints((current) =>
        current.filter(
          (sprint) => sprint.id !== sprintId
        )
      )

    } catch (error) {
      console.error('Delete sprint error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        alert('Unable to delete sprint')
      }
    }
  }

  const getStatusClass = (status) => {
    if (!status) {
      return 'status-default'
    }

    return `status-${status
      .toLowerCase()
      .replace(/\s+/g, '-')}`
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
            className="nav-item active"
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
            className="nav-item"
          >
            <Settings size={20} />
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

      {/* MAIN CONTENT */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Sprints</h1>
            <p>Manage your Agile sprints</p>
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

        <section className="sprints-content">

          {/* HEADER */}

          <div className="sprints-header">

            <div>

              <span className="eyebrow">
                SPRINT MANAGEMENT
              </span>

              <h2>Your Sprints</h2>

              <p>
                View and manage your team's sprint cycles.
              </p>

            </div>

            <button
              type="button"
              className="create-sprint-button"
              onClick={() => {
                setFormError('')
                setShowCreateForm(true)
              }}
            >
              <Plus size={18} />
              New Sprint
            </button>

          </div>

          {/* CREATE SPRINT FORM */}

          {showCreateForm && (

            <div className="sprint-form-overlay">

              <div className="sprint-form-card">

                <div className="sprint-form-header">

                  <div>
                    <h2>Create New Sprint</h2>

                    <p>
                      Add a new sprint to your project.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="close-form-button"
                    onClick={() =>
                      setShowCreateForm(false)
                    }
                  >
                    <X size={20} />
                  </button>

                </div>

                <form onSubmit={handleCreateSprint}>

                  <div className="form-group">

                    <label>Sprint Name</label>

                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Sprint 2"
                      value={formData.name}
                      onChange={handleInputChange}
                    />

                  </div>

                  <div className="form-row">

                    <div className="form-group">

                      <label>Start Date</label>

                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />

                    </div>

                    <div className="form-group">

                      <label>End Date</label>

                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />

                    </div>

                  </div>

                  <div className="form-row">

                    <div className="form-group">

                      <label>Status</label>

                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="ACTIVE">
                          ACTIVE
                        </option>

                        <option value="PLANNED">
                          PLANNED
                        </option>

                        <option value="COMPLETED">
                          COMPLETED
                        </option>

                      </select>

                    </div>

                    <div className="form-group">

                      <label>Project ID</label>

                      <input
                        type="number"
                        name="projectId"
                        placeholder="e.g. 1"
                        value={formData.projectId}
                        onChange={handleInputChange}
                        min="1"
                      />

                    </div>

                  </div>

                  {formError && (
                    <div className="form-error">
                      {formError}
                    </div>
                  )}

                  <div className="form-actions">

                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() =>
                        setShowCreateForm(false)
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="create-sprint-button"
                      disabled={creating}
                    >
                      <Plus size={18} />

                      {creating
                        ? 'Creating...'
                        : 'Create Sprint'}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

          {/* LOADING */}

          {loading && (
            <div className="dashboard-loading">
              Loading sprints...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            sprints.length === 0 && (

            <div className="empty-sprints">

              <CalendarDays size={48} />

              <h3>No sprints yet</h3>

              <p>
                Create your first sprint to start
                managing your team's work.
              </p>

              <button
                type="button"
                className="create-sprint-button"
                onClick={() => {
                  setFormError('')
                  setShowCreateForm(true)
                }}
              >
                <Plus size={18} />
                Create Sprint
              </button>

            </div>
          )}

          {/* SPRINTS */}

          {!loading &&
            !error &&
            sprints.length > 0 && (

            <div className="sprints-grid">

              {sprints.map((sprint) => (

                <div
                  className="sprint-card"
                  key={sprint.id}
                  onClick={() =>
                    handleSprintClick(sprint)
                  }
                >

                  <div className="sprint-card-top">

                    <div className="sprint-icon">
                      <CalendarDays size={24} />
                    </div>

                    <span
                      className={`sprint-status ${getStatusClass(
                        sprint.status
                      )}`}
                    >
                      {sprint.status || 'ACTIVE'}
                    </span>

                  </div>

                  <h3>
                    {sprint.name}
                  </h3>

                  <div className="sprint-dates">

                    <div>
                      <span>Start</span>

                      <strong>
                        {sprint.startDate ||
                          'Not set'}
                      </strong>
                    </div>

                    <div>
                      <span>End</span>

                      <strong>
                        {sprint.endDate ||
                          'Not set'}
                      </strong>
                    </div>

                  </div>

                  <div className="sprint-card-footer">

                    <span>
                      Sprint #{sprint.id}
                    </span>

                    <button
                      type="button"
                      className="delete-sprint-button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDelete(sprint.id)
                      }}
                      title="Delete sprint"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  )
}

export default Sprints