import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
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
  Edit,
  X,
  Circle,
  Clock3,
  CheckCircle2,
  Users,
} from 'lucide-react'

import '../App.css'

function Tasks() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const projectIdFromUrl =
    searchParams.get('projectId')

  const sprintIdFromUrl =
    searchParams.get('sprintId')

  const [user, setUser] = useState({})
  const [tasks, setTasks] = useState([])
  const [sprints, setSprints] = useState([])
  const [projects, setProjects] = useState([])
  const [teamMembers, setTeamMembers] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedSprint, setSelectedSprint] =
    useState(
      sprintIdFromUrl || 'ALL'
    )

  const [showCreateForm, setShowCreateForm] =
    useState(false)

  const [editingTask, setEditingTask] =
    useState(null)

  const [creating, setCreating] =
    useState(false)

  const [updating, setUpdating] =
    useState(false)

  const [formError, setFormError] =
    useState('')

  const [loadingMembers, setLoadingMembers] =
    useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: projectIdFromUrl || '',
    sprintId: sprintIdFromUrl || '',
    assignedToId: '',
  })

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const token =
      localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const storedUser =
        JSON.parse(
          localStorage.getItem('user') || '{}'
        )

      setUser(storedUser)
    } catch {
      localStorage.removeItem('user')
    }

    setSelectedSprint(
      sprintIdFromUrl || 'ALL'
    )

    setFormData((current) => ({
      ...current,
      projectId:
        projectIdFromUrl ||
        current.projectId ||
        '',
      sprintId:
        sprintIdFromUrl ||
        current.sprintId ||
        '',
    }))

    fetchData()
  }, [
    navigate,
    projectIdFromUrl,
    sprintIdFromUrl,
  ])

  // ==========================================
  // AUTH CONFIG
  // ==========================================

  const getAuthConfig = () => {
    const token =
      localStorage.getItem('token')

    return {
      headers: {
        Authorization:
          `Bearer ${token}`,
        'Content-Type':
          'application/json',
      },
    }
  }

  // ==========================================
  // AUTH ERROR HANDLING
  // ==========================================

  const handleUnauthorized = (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
      return true
    }

    if (
      error.response?.status === 403
    ) {
      setError(
        'You do not have permission to access this data.'
      )
      return true
    }

    return false
  }

  // ==========================================
  // LOAD DATA
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const config = getAuthConfig()

      const [
        tasksResponse,
        sprintsResponse,
        projectsResponse,
      ] = await Promise.all([
        axios.get(
          'http://localhost:8080/api/tasks',
          config
        ),

        axios.get(
          'http://localhost:8080/api/sprints',
          config
        ),

        axios.get(
          'http://localhost:8080/api/projects',
          config
        ),
      ])

      const tasksData =
        tasksResponse.data

      const sprintsData =
        sprintsResponse.data

      const projectsData =
        projectsResponse.data

      setTasks(tasksData)
      setSprints(sprintsData)
      setProjects(projectsData)

      // --------------------------------------
      // PROJECT FROM URL
      // --------------------------------------

      let selectedProjectId =
        projectIdFromUrl

      if (
        !selectedProjectId &&
        projectsData.length > 0
      ) {
        selectedProjectId =
          String(projectsData[0].id)
      }

      // --------------------------------------
      // SPRINT FROM URL
      // --------------------------------------

      let selectedSprintId =
        sprintIdFromUrl

      if (
        selectedProjectId &&
        !selectedSprintId
      ) {
        const projectSprints =
          sprintsData.filter(
            (sprint) =>
              String(
                sprint.project?.id
              ) ===
              String(
                selectedProjectId
              )
          )

        if (
          projectSprints.length > 0
        ) {
          selectedSprintId =
            String(
              projectSprints[0].id
            )
        }
      }

      // --------------------------------------
      // UPDATE FORM
      // --------------------------------------

      setFormData((current) => ({
        ...current,

        projectId:
          selectedProjectId ||
          current.projectId ||
          '',

        sprintId:
          selectedSprintId ||
          current.sprintId ||
          '',
      }))

      // --------------------------------------
      // UPDATE FILTER
      // --------------------------------------

      if (sprintIdFromUrl) {
        setSelectedSprint(
          String(sprintIdFromUrl)
        )
      } else if (
        projectIdFromUrl
      ) {
        setSelectedSprint('ALL')
      }

      // --------------------------------------
      // LOAD TEAM
      // --------------------------------------

      if (selectedProjectId) {
        await fetchTeamMembers(
          Number(selectedProjectId)
        )
      }
    } catch (error) {
      console.error(
        'Tasks API error:',
        error
      )

      if (
        !handleUnauthorized(error)
      ) {
        setError(
          'Unable to load tasks'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // LOAD PROJECT TEAM MEMBERS
  // ==========================================

  const fetchTeamMembers = async (
    projectId
  ) => {
    if (!projectId) {
      setTeamMembers([])
      return
    }

    try {
      setLoadingMembers(true)

      const response =
        await axios.get(
          `http://localhost:8080/api/projects/${projectId}/members`,
          getAuthConfig()
        )

      setTeamMembers(
        response.data
      )
    } catch (error) {
      console.error(
        'Team members API error:',
        error
      )

      if (
        !handleUnauthorized(error)
      ) {
        setTeamMembers([])
      }
    } finally {
      setLoadingMembers(false)
    }
  }

  // ==========================================
  // FORM INPUT
  // ==========================================

  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  // ==========================================
  // PROJECT CHANGE
  // ==========================================

  const handleProjectChange =
    async (event) => {
      const projectId =
        event.target.value

      const projectSprints =
        sprints.filter(
          (sprint) =>
            String(
              sprint.project?.id
            ) ===
            String(projectId)
        )

      const firstSprint =
        projectSprints.length > 0
          ? String(
              projectSprints[0].id
            )
          : ''

      setFormData((current) => ({
        ...current,
        projectId,
        sprintId: firstSprint,
        assignedToId: '',
      }))

      await fetchTeamMembers(
        Number(projectId)
      )
    }

  // ==========================================
  // SPRINT CHANGE
  // ==========================================

  const handleSprintChange =
    (event) => {
      setFormData((current) => ({
        ...current,
        sprintId:
          event.target.value,
      }))

      setSelectedSprint(
        event.target.value ||
          'ALL'
      )
    }

  // ==========================================
  // CREATE TASK
  // ==========================================

  const handleCreateTask =
    async (event) => {
      event.preventDefault()

      setFormError('')

      if (
        !formData.title.trim()
      ) {
        setFormError(
          'Task title is required'
        )
        return
      }

      if (!formData.projectId) {
        setFormError(
          'Please select a project'
        )
        return
      }

      if (!formData.sprintId) {
        setFormError(
          'Please select a sprint'
        )
        return
      }

      try {
        setCreating(true)

        const response =
          await axios.post(
            'http://localhost:8080/api/tasks',
            {
              title:
                formData.title,

              description:
                formData.description,

              status:
                formData.status,

              priority:
                formData.priority,

              projectId:
                Number(
                  formData.projectId
                ),

              sprintId:
                Number(
                  formData.sprintId
                ),

              assignedToId:
                formData.assignedToId
                  ? Number(
                      formData.assignedToId
                    )
                  : null,
            },
            getAuthConfig()
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
        setFormError('')
      } catch (error) {
        console.error(
          'Create task error:',
          error
        )

        if (
          !handleUnauthorized(error)
        ) {
          if (
            error.response?.status ===
            403
          ) {
            setFormError(
              'Only ADMIN can create tasks.'
            )
          } else {
            setFormError(
              'Unable to create task. Check the selected project, sprint and team member.'
            )
          }
        }
      } finally {
        setCreating(false)
      }
    }

  // ==========================================
  // START EDIT TASK
  // ==========================================

  const startEditTask =
    async (task) => {
      if (user.role !== 'ADMIN') {
        return
      }

      setEditingTask(task)

      setFormData({
        title:
          task.title || '',

        description:
          task.description || '',

        status:
          task.status || 'TODO',

        priority:
          task.priority || 'MEDIUM',

        projectId:
          task.project?.id
            ? String(
                task.project.id
              )
            : '',

        sprintId:
          task.sprint?.id
            ? String(
                task.sprint.id
              )
            : '',

        assignedToId:
          task.assignedTo?.id
            ? String(
                task.assignedTo.id
              )
            : '',
      })

      setFormError('')

      if (task.project?.id) {
        await fetchTeamMembers(
          Number(
            task.project.id
          )
        )
      }
    }

  // ==========================================
  // UPDATE TASK
  // ==========================================

  const handleEditTask =
    async (event) => {
      event.preventDefault()

      setFormError('')

      if (!editingTask) {
        return
      }

      if (user.role !== 'ADMIN') {
        setFormError(
          'Only ADMIN can edit task details.'
        )
        return
      }

      if (
        !formData.title.trim()
      ) {
        setFormError(
          'Task title is required'
        )
        return
      }

      if (!formData.projectId) {
        setFormError(
          'Please select a project'
        )
        return
      }

      if (!formData.sprintId) {
        setFormError(
          'Please select a sprint'
        )
        return
      }

      try {
        setUpdating(true)

        const response =
          await axios.put(
            `http://localhost:8080/api/tasks/${editingTask.id}`,
            {
              title:
                formData.title,

              description:
                formData.description,

              status:
                formData.status,

              priority:
                formData.priority,

              projectId:
                Number(
                  formData.projectId
                ),

              sprintId:
                Number(
                  formData.sprintId
                ),

              assignedToId:
                formData.assignedToId
                  ? Number(
                      formData.assignedToId
                    )
                  : null,
            },
            getAuthConfig()
          )

        setTasks((current) =>
          current.map((task) =>
            task.id ===
            editingTask.id
              ? response.data
              : task
          )
        )

        setEditingTask(null)
        setFormError('')
      } catch (error) {
        console.error(
          'Edit task error:',
          error
        )

        if (
          error.response?.status ===
          403
        ) {
          setFormError(
            'Only ADMIN can edit task details.'
          )
          return
        }

        if (
          error.response?.status ===
          401
        ) {
          localStorage.removeItem(
            'token'
          )
          localStorage.removeItem(
            'user'
          )
          navigate('/login')
          return
        }

        setFormError(
          'Unable to update task. Check the selected project, sprint and team member.'
        )
      } finally {
        setUpdating(false)
      }
    }

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeTaskForm = () => {
    setShowCreateForm(false)
    setEditingTask(null)
    setFormError('')
  }

  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const openCreateForm = () => {
    if (user.role !== 'ADMIN') {
      return
    }

    const projectId =
      projectIdFromUrl ||
      formData.projectId ||
      (projects.length > 0
        ? String(projects[0].id)
        : '')

    let sprintId =
      sprintIdFromUrl ||
      formData.sprintId ||
      ''

    if (
      projectId &&
      !sprintId
    ) {
      const projectSprints =
        sprints.filter(
          (sprint) =>
            String(
              sprint.project?.id
            ) ===
            String(projectId)
        )

      if (
        projectSprints.length > 0
      ) {
        sprintId =
          String(
            projectSprints[0].id
          )
      }
    }

    setFormData((current) => ({
      ...current,
      projectId,
      sprintId,
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      assignedToId: '',
    }))

    setEditingTask(null)
    setFormError('')
    setShowCreateForm(true)

    if (projectId) {
      fetchTeamMembers(
        Number(projectId)
      )
    }
  }

  // ==========================================
  // UPDATE TASK STATUS
  // ==========================================

  const updateTaskStatus =
    async (
      taskId,
      newStatus
    ) => {
      try {
        const response =
          await axios.patch(
            `http://localhost:8080/api/tasks/${taskId}/status?status=${newStatus}`,
            {},
            getAuthConfig()
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
          !handleUnauthorized(error)
        ) {
          if (
            error.response?.status ===
            403
          ) {
            alert(
              'You can only update tasks assigned to you.'
            )
          } else {
            alert(
              'Unable to update task status'
            )
          }
        }
      }
    }

  // ==========================================
  // DELETE TASK
  // ==========================================

  const deleteTask = async (
    taskId
  ) => {
    if (user.role !== 'ADMIN') {
      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this task?'
      )

    if (!confirmed) {
      return
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/tasks/${taskId}`,
        getAuthConfig()
      )

      setTasks((current) =>
        current.filter(
          (task) =>
            task.id !== taskId
        )
      )
    } catch (error) {
      console.error(
        'Delete task error:',
        error
      )

      if (
        !handleUnauthorized(error)
      ) {
        if (
          error.response?.status ===
          403
        ) {
          alert(
            'Only ADMIN can delete tasks.'
          )
        } else {
          alert(
            'Unable to delete task'
          )
        }
      }
    }
  }

  // ==========================================
  // FILTER TASKS
  // ==========================================

  const filteredSprints =
    projectIdFromUrl
      ? sprints.filter(
          (sprint) =>
            String(
              sprint.project?.id
            ) ===
            String(
              projectIdFromUrl
            )
        )
      : sprints

  const filteredTasks =
    tasks.filter((task) => {
      const matchesProject =
        !projectIdFromUrl ||
        String(
          task.project?.id
        ) ===
          String(
            projectIdFromUrl
          )

      const matchesSprint =
        selectedSprint === 'ALL' ||
        String(
          task.sprint?.id
        ) ===
          String(
            selectedSprint
          )

      return (
        matchesProject &&
        matchesSprint
      )
    })

  const todoTasks =
    filteredTasks.filter(
      (task) =>
        task.status === 'TODO'
    )

  const inProgressTasks =
    filteredTasks.filter(
      (task) =>
        task.status ===
        'IN_PROGRESS'
    )

  const doneTasks =
    filteredTasks.filter(
      (task) =>
        task.status === 'DONE'
    )

  // ==========================================
  // HELPERS
  // ==========================================

  const getPriorityClass =
    (priority) => {
      if (!priority) {
        return 'priority-none'
      }

      return `priority-${priority.toLowerCase()}`
    }

  const getSelectedProject =
    () => {
      return projects.find(
        (project) =>
          String(project.id) ===
          String(
            projectIdFromUrl
          )
      )
    }

  const getSelectedSprint =
    () => {
      return sprints.find(
        (sprint) =>
          String(sprint.id) ===
          String(
            selectedSprint
          )
      )
    }

  // ==========================================
  // TASK CARD
  // ==========================================

  const renderTaskCard = (
    task
  ) => {
    const canUpdateStatus =
      user.role === 'ADMIN' ||
      String(
        task.assignedTo?.id
      ) ===
        String(user.id)

    return (
      <div
        className="kanban-task-card"
        key={task.id}
      >

        <div className="task-card-header">

          <div
            style={{
              flex: 1,
            }}
          >
            <span
              className="task-project-name"
            >
              {task.project?.name ||
                'Project'}
            </span>
          </div>

          {user.role ===
            'ADMIN' && (
            <div
              style={{
                display:
                  'flex',
                gap: '6px',
              }}
            >

              <button
                type="button"
                className="task-delete-button"
                onClick={() =>
                  startEditTask(
                    task
                  )
                }
                title="Edit task"
              >
                <Edit
                  size={15}
                />
              </button>

              <button
                type="button"
                className="task-delete-button"
                onClick={() =>
                  deleteTask(
                    task.id
                  )
                }
                title="Delete task"
              >
                <Trash2
                  size={15}
                />
              </button>

            </div>
          )}

        </div>

        <h3>
          {task.title}
        </h3>

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
            {task.priority ||
              'NO PRIORITY'}
          </span>

          {task.sprint && (
            <span className="task-sprint">
              {task.sprint.name}
            </span>
          )}

        </div>

        {/* ASSIGNED MEMBER */}

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

        {/* STATUS ACTIONS */}

        {canUpdateStatus && (
          <div className="task-status-actions">

            {task.status !==
              'TODO' && (
              <button
                type="button"
                onClick={() =>
                  updateTaskStatus(
                    task.id,
                    'TODO'
                  )
                }
              >
                <Circle
                  size={14}
                />
                To Do
              </button>
            )}

            {task.status !==
              'IN_PROGRESS' && (
              <button
                type="button"
                onClick={() =>
                  updateTaskStatus(
                    task.id,
                    'IN_PROGRESS'
                  )
                }
              >
                <Clock3
                  size={14}
                />
                Progress
              </button>
            )}

            {task.status !==
              'DONE' && (
              <button
                type="button"
                onClick={() =>
                  updateTaskStatus(
                    task.id,
                    'DONE'
                  )
                }
              >
                <CheckCircle2
                  size={14}
                />
                Done
              </button>
            )}

          </div>
        )}

      </div>
    )
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem(
      'token'
    )

    localStorage.removeItem(
      'user'
    )

    navigate('/login')
  }

  // ==========================================
  // UI
  // ==========================================
const selectedProject =
  getSelectedProject()

const selectedSprintDetails =
  getSelectedSprint()

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <BrainCircuit
              size={26}
            />
          </div>

          <div>
            <h2>SprintIQ</h2>
            <span>
              Agile Intelligence
            </span>
          </div>

        </div>

        <nav className="nav-menu">

          <Link
            to="/dashboard"
            className="nav-item"
          >
            <LayoutDashboard
              size={20}
            />
            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/projects"
            className="nav-item"
          >
            <FolderKanban
              size={20}
            />
            <span>
              Projects
            </span>
          </Link>

          <Link
            to="/sprints"
            className="nav-item"
          >
            <CalendarDays
              size={20}
            />
            <span>
              Sprints
            </span>
          </Link>

          <Link
            to="/tasks"
            className="nav-item active"
          >
            <ListTodo
              size={20}
            />
            <span>
              Tasks
            </span>
          </Link>

          <Link
            to="/ai-insights"
            className="nav-item"
          >
            <BrainCircuit
              size={20}
            />
            <span>
              AI Insights
            </span>
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <Link
            to="/settings"
            className="nav-item"
          >
            <Settings
              size={20}
            />
            <span>
              Settings
            </span>
          </Link>

          <button
            type="button"
            className="nav-item logout-button"
            onClick={
              handleLogout
            }
          >
            <LogOut
              size={20}
            />
            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>
              Tasks
            </h1>

            <p>
              Manage your sprint work
            </p>
          </div>

          <div className="user-profile">

            <div className="avatar">
              {(user.name ||
                'B')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user.name ||
                  'User'}
              </strong>

              <span>
                {user.role ||
                  'Member'}
              </span>
            </div>

          </div>

        </header>

        <section className="tasks-content">

          {/* HEADER */}

          <div className="tasks-header">

            <div>

              <span className="eyebrow">
                TASK MANAGEMENT
              </span>

              <h2>
                Task Board
              </h2>

              <p>
                {selectedSprintDetails
  ? `${selectedSprintDetails.name} tasks`
  : selectedProject
    ? `${selectedProject.name} tasks`
    : 'Track work from To Do to Done.'}
              </p>

            </div>

            {user.role ===
              'ADMIN' && (
              <button
                type="button"
                className="create-sprint-button"
                onClick={
                  openCreateForm
                }
              >
                <Plus
                  size={18}
                />
                New Task
              </button>
            )}

          </div>

          {/* CURRENT CONTEXT */}

          {(selectedProject ||
            selectedSprint) && (
            <div
              className="task-context"
              style={{
                marginBottom:
                  '18px',
                display:
                  'flex',
                gap: '10px',
                flexWrap:
                  'wrap',
              }}
            >

              {selectedProject && (
                <span
                  className="task-project-name"
                >
                  Project: {
                    selectedProject.name
                  }
                </span>
              )}

             {selectedSprintDetails && (
  <span className="task-sprint">
    Sprint: {
      selectedSprintDetails.name
    }
  </span>
)}

            </div>
          )}

          {/* SPRINT FILTER */}

          <div className="task-toolbar">

            <div className="task-filter">

              <CalendarDays
                size={18}
              />

              <label htmlFor="sprint-filter">
                Sprint
              </label>

              <select
                id="sprint-filter"
                value={
                  selectedSprint
                }
                onChange={
                  handleSprintChange
                }
              >

                {!sprintIdFromUrl && (
                  <option value="ALL">
                    All Sprints
                  </option>
                )}

                {filteredSprints.map(
                  (sprint) => (
                    <option
                      key={
                        sprint.id
                      }
                      value={
                        sprint.id
                      }
                    >
                      {sprint.name}
                    </option>
                  )
                )}

              </select>

            </div>

            <span className="task-count">
              {filteredTasks.length}{' '}
              {filteredTasks.length ===
              1
                ? 'task'
                : 'tasks'}
            </span>

          </div>

          {/* CREATE / EDIT TASK FORM */}

          {(showCreateForm ||
            editingTask) && (

            <div className="sprint-form-overlay">

              <div className="sprint-form-card task-form-card">

                <div className="sprint-form-header">

                  <div>

                    <h2>
                      {editingTask
                        ? 'Edit Task'
                        : 'Create New Task'}
                    </h2>

                    <p>
                      {editingTask
                        ? 'Update task details.'
                        : 'Add work to a project and sprint.'}
                    </p>

                  </div>

                  <button
                    type="button"
                    className="close-form-button"
                    onClick={
                      closeTaskForm
                    }
                  >
                    <X
                      size={20}
                    />
                  </button>

                </div>

                <form
                  onSubmit={
                    editingTask
                      ? handleEditTask
                      : handleCreateTask
                  }
                >

                  {/* TITLE */}

                  <div className="form-group">

                    <label>
                      Task Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Build login page"
                      value={
                        formData.title
                      }
                      onChange={
                        handleInputChange
                      }
                    />

                  </div>

                  {/* DESCRIPTION */}

                  <div className="form-group">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      placeholder="Describe the task..."
                      value={
                        formData.description
                      }
                      onChange={
                        handleInputChange
                      }
                      rows="3"
                    />

                  </div>

                  {/* STATUS + PRIORITY */}

                  <div className="form-row">

                    <div className="form-group">

                      <label>
                        Status
                      </label>

                      <select
                        name="status"
                        value={
                          formData.status
                        }
                        onChange={
                          handleInputChange
                        }
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
                        value={
                          formData.priority
                        }
                        onChange={
                          handleInputChange
                        }
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

                  {/* PROJECT + SPRINT */}

                  <div className="form-row">

                    <div className="form-group">

                      <label>
                        Project
                      </label>

                      <select
                        name="projectId"
                        value={
                          formData.projectId
                        }
                        onChange={
                          handleProjectChange
                        }
                        disabled={
                          Boolean(
                            projectIdFromUrl
                          ) &&
                          Boolean(
                            sprintIdFromUrl
                          )
                        }
                      >

                        <option value="">
                          Select Project
                        </option>

                        {projects.map(
                          (project) => (
                            <option
                              key={
                                project.id
                              }
                              value={
                                project.id
                              }
                            >
                              {
                                project.name
                              }
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div className="form-group">

                      <label>
                        Sprint
                      </label>

                      <select
                        name="sprintId"
                        value={
                          formData.sprintId
                        }
                        onChange={
                          handleSprintChange
                        }
                        disabled={
                          Boolean(
                            sprintIdFromUrl
                          )
                        }
                      >

                        <option value="">
                          Select Sprint
                        </option>

                        {sprints
                          .filter(
                            (sprint) =>
                              String(
                                sprint.project?.id
                              ) ===
                              String(
                                formData.projectId
                              )
                          )
                          .map(
                            (sprint) => (
                              <option
                                key={
                                  sprint.id
                                }
                                value={
                                  sprint.id
                                }
                              >
                                {
                                  sprint.name
                                }
                              </option>
                            )
                          )}

                      </select>

                    </div>

                  </div>

                  {/* ASSIGNED TO */}

                  <div className="form-group">

                    <label
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: '6px',
                      }}
                    >
                      <Users
                        size={16}
                      />
                      Assigned To
                    </label>

                    <select
                      name="assignedToId"
                      value={
                        formData.assignedToId
                      }
                      onChange={
                        handleInputChange
                      }
                      disabled={
                        !formData.projectId ||
                        loadingMembers
                      }
                    >

                      <option value="">
                        {!formData.projectId
                          ? 'Select a project first'
                          : loadingMembers
                            ? 'Loading team members...'
                            : teamMembers.length ===
                                0
                              ? 'No team members'
                              : 'Unassigned'}
                      </option>

                      {teamMembers.map(
                        (member) => (
                          <option
                            key={
                              member.id
                            }
                            value={
                              member.id
                            }
                          >
                            {
                              member.name
                            }
                            {' — '}
                            {
                              member.email
                            }
                          </option>
                        )
                      )}

                    </select>

                    {formData.projectId &&
                      !loadingMembers &&
                      teamMembers.length ===
                        0 && (
                        <small
                          style={{
                            color:
                              '#64748b',
                            marginTop:
                              '6px',
                            display:
                              'block',
                          }}
                        >
                          Add team members to
                          this project first.
                        </small>
                      )}

                  </div>

                  {/* ERROR */}

                  {formError && (
                    <div className="form-error">
                      {formError}
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="form-actions">

                    <button
                      type="button"
                      className="cancel-button"
                      onClick={
                        closeTaskForm
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="create-sprint-button"
                      disabled={
                        creating ||
                        updating
                      }
                    >

                      {editingTask ? (
                        <Edit
                          size={18}
                        />
                      ) : (
                        <Plus
                          size={18}
                        />
                      )}

                      {editingTask
                        ? updating
                          ? 'Saving...'
                          : 'Save Changes'
                        : creating
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

          {!loading &&
            error && (
              <div className="dashboard-error">
                {error}
              </div>
            )}

          {/* KANBAN */}

          {!loading &&
            !error && (

              <div className="kanban-board">

                {/* TODO */}

                <div className="kanban-column">

                  <div className="kanban-column-header">

                    <div>
                      <Circle
                        size={17}
                      />
                      <h3>
                        To Do
                      </h3>
                    </div>

                    <span>
                      {
                        todoTasks.length
                      }
                    </span>

                  </div>

                  <div className="kanban-tasks">

                    {todoTasks.map(
                      renderTaskCard
                    )}

                    {todoTasks.length ===
                      0 && (
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
                      <Clock3
                        size={17}
                      />

                      <h3>
                        In Progress
                      </h3>
                    </div>

                    <span>
                      {
                        inProgressTasks.length
                      }
                    </span>

                  </div>

                  <div className="kanban-tasks">

                    {inProgressTasks.map(
                      renderTaskCard
                    )}

                    {inProgressTasks.length ===
                      0 && (
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
                      <CheckCircle2
                        size={17}
                      />

                      <h3>
                        Done
                      </h3>
                    </div>

                    <span>
                      {
                        doneTasks.length
                      }
                    </span>

                  </div>

                  <div className="kanban-tasks">

                    {doneTasks.map(
                      renderTaskCard
                    )}

                    {doneTasks.length ===
                      0 && (
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