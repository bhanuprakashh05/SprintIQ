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
  Folder,
  ListChecks,
  CalendarCheck,
} from 'lucide-react'

import '../App.css'

function Projects() {
  const navigate = useNavigate()

  const [user, setUser] = useState({})
  const [projects, setProjects] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
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

    fetchProjects()
  }, [navigate])

  const fetchProjects = async () => {
  try {
    setLoading(true)
    setError('')

    const token = localStorage.getItem('token')

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    const [
      projectsResponse,
      sprintsResponse,
      tasksResponse,
    ] = await Promise.all([
      axios.get(
        'http://localhost:8080/api/projects',
        config
      ),
      axios.get(
        'http://localhost:8080/api/sprints',
        config
      ),
      axios.get(
        'http://localhost:8080/api/tasks',
        config
      ),
    ])

    const projects = projectsResponse.data
    const sprints = sprintsResponse.data
    const tasks = tasksResponse.data

    const projectsWithCounts = projects.map(
      (project) => {

        const projectSprints = sprints.filter(
          (sprint) =>
            sprint.project?.id === project.id
        )

        const projectTasks = tasks.filter(
          (task) =>
            task.project?.id === project.id
        )

        return {
          ...project,
          sprintCount: projectSprints.length,
          taskCount: projectTasks.length,
        }
      }
    )

    setProjects(projectsWithCounts)

  } catch (error) {
    console.error(
      'Projects API error:',
      error
    )

    if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    } else {
      setError('Unable to load projects')
    }

  } finally {
    setLoading(false)
  }
}

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCreateProject = async (event) => {
    event.preventDefault()

    setFormError('')

    if (!formData.name.trim()) {
      setFormError('Project name is required')
      return
    }

    try {
      setCreating(true)

      const token = localStorage.getItem('token')

      const response = await axios.post(
        'http://localhost:8080/api/projects',
        {
          name: formData.name,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setProjects((current) => [
        ...current,
        response.data,
      ])

      setFormData({
        name: '',
        description: '',
      })

      setShowCreateForm(false)

    } catch (error) {
      console.error('Create project error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        setFormError('Unable to create project')
      }

    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    )

    if (!confirmed) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      await axios.delete(
        `http://localhost:8080/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setProjects((current) =>
        current.filter(
          (project) => project.id !== projectId
        )
      )

    } catch (error) {
      console.error('Delete project error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        alert(
          'Unable to delete project. It may contain sprints or tasks.'
        )
      }
    }
  }

const getProjectSprintCount = (project) => {
  return project.sprintCount ?? 0
}

const getProjectTaskCount = (project) => {
  return project.taskCount ?? 0
}

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

          <a
            href="/dashboard"
            className="nav-item"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>

          <a
            href="/projects"
            className="nav-item active"
          >
            <FolderKanban size={20} />
            <span>Projects</span>
          </a>

          <a
            href="/sprints"
            className="nav-item"
          >
            <CalendarDays size={20} />
            <span>Sprints</span>
          </a>

          <a
            href="/tasks"
            className="nav-item"
          >
            <ListTodo size={20} />
            <span>Tasks</span>
          </a>

          <a href="/ai-insights" className="nav-item">
  <BrainCircuit size={20} />
  <span>AI Insights</span>
</a>

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

      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Projects</h1>
            <p>Manage your Agile projects</p>
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

        <section className="projects-content">

          {/* PAGE HEADER */}

          <div className="projects-header">

            <div>
              <span className="eyebrow">
                PROJECT MANAGEMENT
              </span>

              <h2>Your Projects</h2>

              <p>
                Create and manage your Agile projects.
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
              New Project
            </button>

          </div>

          {/* CREATE FORM */}

          {showCreateForm && (

            <div className="sprint-form-overlay">

              <div className="sprint-form-card">

                <div className="sprint-form-header">

                  <div>
                    <h2>Create New Project</h2>

                    <p>
                      Add a new project to SprintIQ.
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

                <form onSubmit={handleCreateProject}>

                  <div className="form-group">

                    <label>
                      Project Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. SprintIQ"
                      value={formData.name}
                      onChange={handleInputChange}
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      placeholder="Describe your project..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                    />

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
                        : 'Create Project'}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

          {/* LOADING */}

          {loading && (
            <div className="dashboard-loading">
              Loading projects...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* PROJECTS */}

          {!loading && !error && (

            <div className="projects-grid">

              {projects.map((project) => (

                <div
                  className="project-card"
                  key={project.id}
                >

                  <div className="project-card-top">

                    <div className="project-icon">
                      <Folder size={24} />
                    </div>

                    <button
                      type="button"
                      className="project-delete-button"
                      onClick={() =>
                        handleDeleteProject(
                          project.id
                        )
                      }
                      title="Delete project"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                  <h3>
                    {project.name}
                  </h3>

                  <p className="project-description">
                    {project.description ||
                      'No description provided.'}
                  </p>

                  <div className="project-stats">

                    <div>
                      <CalendarCheck size={17} />

                      <span>
                        Sprints
                      </span>

                      <strong>
                        {getProjectSprintCount(
                          project
                        )}
                      </strong>
                    </div>

                    <div>
                      <ListChecks size={17} />

                      <span>
                        Tasks
                      </span>

                      <strong>
                        {getProjectTaskCount(
                          project
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="project-card-footer">

                    <span>
                      Project #{project.id}
                    </span>

                  </div>

                </div>

              ))}

              {projects.length === 0 && (

                <div className="empty-projects">

                  <FolderKanban size={42} />

                  <h3>
                    No projects yet
                  </h3>

                  <p>
                    Create your first project
                    to get started.
                  </p>

                  <button
                    type="button"
                    className="create-sprint-button"
                    onClick={() =>
                      setShowCreateForm(true)
                    }
                  >
                    <Plus size={18} />
                    Create Project
                  </button>

                </div>

              )}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default Projects