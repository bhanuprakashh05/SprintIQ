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
  Circle,
  Clock3,
  CheckCircle2,
} from 'lucide-react'

import '../App.css'

function Tasks() {
  const navigate = useNavigate()

  const [user, setUser] = useState({})
  const [tasks, setTasks] = useState([])
  const [sprints, setSprints] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedSprint, setSelectedSprint] = useState('ALL')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '1',
    sprintId: '',
    assignedToId: '',
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

    fetchData()
  }, [navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const [tasksResponse, sprintsResponse] =
        await Promise.all([
          axios.get(
            'http://localhost:8080/api/tasks',
            config
          ),
          axios.get(
            'http://localhost:8080/api/sprints',
            config
          ),
        ])

      setTasks(tasksResponse.data)
      setSprints(sprintsResponse.data)

      if (sprintsResponse.data.length > 0) {
        setFormData((current) => ({
          ...current,
          sprintId:
            current.sprintId ||
            String(sprintsResponse.data[0].id),
        }))
      }

    } catch (error) {
      console.error('Tasks API error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        setError('Unable to load tasks')
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

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCreateTask = async (event) => {
    event.preventDefault()

    setFormError('')

    if (!formData.title.trim()) {
      setFormError('Task title is required')
      return
    }

    if (!formData.projectId) {
      setFormError('Project ID is required')
      return
    }

    if (!formData.sprintId) {
      setFormError('Please select a sprint')
      return
    }

    try {
      setCreating(true)

      const token = localStorage.getItem('token')

      const response = await axios.post(
        'http://localhost:8080/api/tasks',
        {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          projectId: Number(formData.projectId),
          sprintId: Number(formData.sprintId),
          assignedToId: formData.assignedToId
            ? Number(formData.assignedToId)
            : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setTasks((current) => [
        ...current,
        response.data,
      ])

      setFormData((current) => ({
        ...current,
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedToId: '',
      }))

      setShowCreateForm(false)

    } catch (error) {
      console.error('Create task error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        setFormError(
          'Unable to create task. Check the Project ID and Sprint.'
        )
      }

    } finally {
      setCreating(false)
    }
  }

  const updateTaskStatus = async (
    taskId,
    newStatus
  ) => {
    try {
      const token = localStorage.getItem('token')

      const response = await axios.patch(
        `http://localhost:8080/api/tasks/${taskId}/status?status=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? response.data
            : task
        )
      )

    } catch (error) {
      console.error(
        'Update task status error:',
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
        alert('Unable to update task status')
      }
    }
  }

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (!confirmed) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      await axios.delete(
        `http://localhost:8080/api/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setTasks((current) =>
        current.filter(
          (task) => task.id !== taskId
        )
      )

    } catch (error) {
      console.error('Delete task error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        alert('Unable to delete task')
      }
    }
  }

  const filteredTasks =
    selectedSprint === 'ALL'
      ? tasks
      : tasks.filter(
          (task) =>
            String(task.sprint?.id) ===
            String(selectedSprint)
        )

  const todoTasks = filteredTasks.filter(
    (task) => task.status === 'TODO'
  )

  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === 'IN_PROGRESS'
  )

  const doneTasks = filteredTasks.filter(
    (task) => task.status === 'DONE'
  )

  const getPriorityClass = (priority) => {
    if (!priority) {
      return 'priority-none'
    }

    return `priority-${priority.toLowerCase()}`
  }

  const renderTaskCard = (task) => (
    <div
      className="kanban-task-card"
      key={task.id}
    >

      <div className="task-card-header">

        <span className="task-id">
          #{task.id}
        </span>

        <button
          type="button"
          className="task-delete-button"
          onClick={() =>
            deleteTask(task.id)
          }
          title="Delete task"
        >
          <Trash2 size={15} />
        </button>

      </div>

      <h3>{task.title}</h3>

      {task.description && (
        <p className="task-description">
          {task.description}
        </p>
      )}

      <div className="task-meta">

        <span
          className={`task-priority ${getPriorityClass(
            task.priority
          )}`}
        >
          {task.priority || 'NO PRIORITY'}
        </span>

        {task.sprint && (
          <span className="task-sprint">
            {task.sprint.name}
          </span>
        )}

      </div>

      {task.assignedTo && (
        <div className="task-assignee">
          <div className="small-avatar">
            {task.assignedTo.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <span>
            {task.assignedTo.name}
          </span>
        </div>
      )}

      <div className="task-status-actions">

        {task.status !== 'TODO' && (
          <button
            type="button"
            onClick={() =>
              updateTaskStatus(
                task.id,
                'TODO'
              )
            }
          >
            <Circle size={14} />
            To Do
          </button>
        )}

        {task.status !== 'IN_PROGRESS' && (
          <button
            type="button"
            onClick={() =>
              updateTaskStatus(
                task.id,
                'IN_PROGRESS'
              )
            }
          >
            <Clock3 size={14} />
            Progress
          </button>
        )}

        {task.status !== 'DONE' && (
          <button
            type="button"
            onClick={() =>
              updateTaskStatus(
                task.id,
                'DONE'
              )
            }
          >
            <CheckCircle2 size={14} />
            Done
          </button>
        )}

      </div>

    </div>
  )

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
            href="#"
            className="nav-item"
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
            className="nav-item active"
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
            <h1>Tasks</h1>
            <p>
              Manage your sprint work
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

        <section className="tasks-content">

          <div className="tasks-header">

            <div>
              <span className="eyebrow">
                TASK MANAGEMENT
              </span>

              <h2>Task Board</h2>

              <p>
                Track work from To Do to Done.
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
              New Task
            </button>

          </div>

          {/* SPRINT FILTER */}

          <div className="task-toolbar">

            <div className="task-filter">

              <CalendarDays size={18} />

              <label htmlFor="sprint-filter">
                Sprint
              </label>

              <select
                id="sprint-filter"
                value={selectedSprint}
                onChange={(event) =>
                  setSelectedSprint(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All Sprints
                </option>

                {sprints.map((sprint) => (
                  <option
                    key={sprint.id}
                    value={sprint.id}
                  >
                    {sprint.name}
                  </option>
                ))}

              </select>

            </div>

            <span className="task-count">
              {filteredTasks.length} tasks
            </span>

          </div>

          {/* CREATE TASK FORM */}

          {showCreateForm && (

            <div className="sprint-form-overlay">

              <div className="sprint-form-card task-form-card">

                <div className="sprint-form-header">

                  <div>
                    <h2>Create New Task</h2>

                    <p>
                      Add work to a sprint.
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

                <form
                  onSubmit={handleCreateTask}
                >

                  <div className="form-group">

                    <label>
                      Task Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Build login page"
                      value={formData.title}
                      onChange={handleInputChange}
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      placeholder="Describe the task..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />

                  </div>

                  <div className="form-row">

                    <div className="form-group">

                      <label>
                        Status
                      </label>

                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="TODO">
                          To Do
                        </option>

                        <option value="IN_PROGRESS">
                          In Progress
                        </option>

                        <option value="DONE">
                          Done
                        </option>
                      </select>

                    </div>

                    <div className="form-group">

                      <label>
                        Priority
                      </label>

                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="LOW">
                          Low
                        </option>

                        <option value="MEDIUM">
                          Medium
                        </option>

                        <option value="HIGH">
                          High
                        </option>
                      </select>

                    </div>

                  </div>

                  <div className="form-row">

                    <div className="form-group">

                      <label>
                        Sprint
                      </label>

                      <select
                        name="sprintId"
                        value={formData.sprintId}
                        onChange={handleInputChange}
                      >
                        <option value="">
                          Select Sprint
                        </option>

                        {sprints.map((sprint) => (
                          <option
                            key={sprint.id}
                            value={sprint.id}
                          >
                            {sprint.name}
                          </option>
                        ))}

                      </select>

                    </div>

                    <div className="form-group">

                      <label>
                        Project ID
                      </label>

                      <input
                        type="number"
                        name="projectId"
                        min="1"
                        value={formData.projectId}
                        onChange={handleInputChange}
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
                        : 'Create Task'}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

          {/* LOADING */}

          {loading && (
            <div className="dashboard-loading">
              Loading tasks...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* KANBAN */}

          {!loading && !error && (

            <div className="kanban-board">

              {/* TODO */}

              <div className="kanban-column">

                <div className="kanban-column-header">

                  <div>
                    <Circle size={17} />
                    <h3>To Do</h3>
                  </div>

                  <span>
                    {todoTasks.length}
                  </span>

                </div>

                <div className="kanban-tasks">

                  {todoTasks.map(
                    renderTaskCard
                  )}

                  {todoTasks.length === 0 && (
                    <div className="empty-column">
                      No tasks
                    </div>
                  )}

                </div>

              </div>

              {/* IN PROGRESS */}

              <div className="kanban-column">

                <div className="kanban-column-header">

                  <div>
                    <Clock3 size={17} />
                    <h3>In Progress</h3>
                  </div>

                  <span>
                    {inProgressTasks.length}
                  </span>

                </div>

                <div className="kanban-tasks">

                  {inProgressTasks.map(
                    renderTaskCard
                  )}

                  {inProgressTasks.length === 0 && (
                    <div className="empty-column">
                      No tasks
                    </div>
                  )}

                </div>

              </div>

              {/* DONE */}

              <div className="kanban-column">

                <div className="kanban-column-header">

                  <div>
                    <CheckCircle2 size={17} />
                    <h3>Done</h3>
                  </div>

                  <span>
                    {doneTasks.length}
                  </span>

                </div>

                <div className="kanban-tasks">

                  {doneTasks.map(
                    renderTaskCard
                  )}

                  {doneTasks.length === 0 && (
                    <div className="empty-column">
                      No tasks
                    </div>
                  )}

                </div>

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default Tasks