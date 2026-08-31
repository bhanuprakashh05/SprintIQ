import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import axios from 'axios'
import { useLocation } from 'react-router-dom'

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
  Edit,
  CheckCircle2,
} from 'lucide-react'

import '../App.css'

function Sprints() {

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const selectedProjectId =
    searchParams.get('projectId')

  const [user, setUser] = useState({})
  const [sprints, setSprints] = useState([])
  const [projects, setProjects] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] =
    useState(false)

  const [showEditForm, setShowEditForm] =
    useState(false)

  const [editingSprint, setEditingSprint] =
    useState(null)

  const [creating, setCreating] =
    useState(false)

  const [updating, setUpdating] =
    useState(false)

  const [formError, setFormError] =
    useState('')

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    projectId: '',
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

    const storedUser = JSON.parse(
      localStorage.getItem('user') || '{}'
    )

    setUser(storedUser)

    fetchSprints()

  }, [
    navigate,
    location.pathname,
    selectedProjectId,
  ])


  // ==========================================
  // REFRESH WHEN WINDOW GETS FOCUS
  // ==========================================

  useEffect(() => {

    const handleFocus = () => {

      if (location.pathname === '/sprints') {
        fetchSprints()
      }

    }

    window.addEventListener(
      'focus',
      handleFocus
    )

    return () => {

      window.removeEventListener(
        'focus',
        handleFocus
      )

    }

  }, [
    location.pathname,
    selectedProjectId,
  ])


  // ==========================================
  // AUTH CONFIG
  // ==========================================

  const getAuthConfig = () => {

    const token =
      localStorage.getItem('token')

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }


  // ==========================================
  // HANDLE UNAUTHORIZED
  // ==========================================

  const handleUnauthorized = (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      navigate('/login')

      return true
    }

    return false
  }


  // ==========================================
  // FETCH SPRINTS + PROJECTS + PROGRESS
  // ==========================================

  const fetchSprints = async () => {

    try {

      setLoading(true)
      setError('')

      const config = getAuthConfig()

      const [
        sprintsResponse,
        projectsResponse,
      ] = await Promise.all([

        axios.get(
          'http://localhost:8080/api/sprints',
          config
        ),

        axios.get(
          'http://localhost:8080/api/projects',
          config
        ),

      ])

      const sprintData =
        sprintsResponse.data

      const projectData =
        projectsResponse.data

      setProjects(projectData)


      // ========================================
      // FILTER BY PROJECT
      // ========================================

      const filteredSprints =
        selectedProjectId
          ? sprintData.filter(
              (sprint) =>
                String(
                  sprint.project?.id
                ) ===
                String(selectedProjectId)
            )
          : sprintData


      // ========================================
      // LOAD PROGRESS FOR EACH SPRINT
      // ========================================

      const sprintsWithProgress =
        await Promise.all(

          filteredSprints.map(
            async (sprint) => {

              try {

                const progressResponse =
                  await axios.get(
                    `http://localhost:8080/api/sprints/${sprint.id}/progress`,
                    config
                  )

                return {
                  ...sprint,
                  progress:
                    Number(
                      progressResponse.data
                    ) || 0,
                }

              } catch (progressError) {

                console.error(
                  `Unable to load progress for sprint ${sprint.id}:`,
                  progressError
                )

                return {
                  ...sprint,
                  progress: 0,
                }
              }

            }
          )
        )


      // ========================================
      // SORT SPRINTS
      // ========================================

      const sortedSprints =
        [...sprintsWithProgress].sort(
          (a, b) => {

            const aNumber =
              extractSprintNumber(a.name)

            const bNumber =
              extractSprintNumber(b.name)

            if (
              aNumber !== null &&
              bNumber !== null
            ) {
              return aNumber - bNumber
            }

            if (
              aNumber !== null &&
              bNumber === null
            ) {
              return -1
            }

            if (
              aNumber === null &&
              bNumber !== null
            ) {
              return 1
            }

            return (
              String(a.name || '').localeCompare(
                String(b.name || '')
              )
            )
          }
        )


      setSprints(sortedSprints)

    } catch (error) {

      console.error(
        'Sprints API error:',
        error
      )

      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        navigate('/login')

      } else if (
        error.response?.status === 403
      ) {

        setError(
          'You do not have permission to view sprints.'
        )

      } else {

        setError(
          'Unable to load sprints'
        )
      }

    } finally {

      setLoading(false)
    }
  }


  // ==========================================
  // EXTRACT SPRINT NUMBER
  // ==========================================

  const extractSprintNumber = (name) => {

    if (!name) {
      return null
    }

    const match =
      String(name).match(
        /sprint\s*#?\s*(\d+)/i
      )

    if (!match) {
      return null
    }

    return Number(match[1])
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }


  // ==========================================
  // SPRINT CLICK
  // ==========================================

  const handleSprintClick = (sprint) => {
  navigate(
    `/tasks?projectId=${sprint.project?.id}&sprintId=${sprint.id}`
  )
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

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    )
  }


  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {

    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      projectId: '',
    })

    setEditingSprint(null)
    setFormError('')
  }


  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const openCreateForm = () => {

    resetForm()

    // If we came from a project,
    // automatically select that project.
    if (selectedProjectId) {

      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
        projectId: String(
          selectedProjectId
        ),
      })

    }

    setShowEditForm(false)
    setShowCreateForm(true)
  }


  // ==========================================
  // CLOSE CREATE FORM
  // ==========================================

  const closeCreateForm = () => {

    setShowCreateForm(false)
    setFormError('')

    resetForm()
  }


  // ==========================================
  // CLOSE EDIT FORM
  // ==========================================

  const closeEditForm = () => {

    setShowEditForm(false)
    setFormError('')

    resetForm()
  }


  // ==========================================
  // CREATE SPRINT
  // ==========================================

  const handleCreateSprint = async (
    event
  ) => {

    event.preventDefault()

    setFormError('')


    if (!formData.name.trim()) {

      setFormError(
        'Sprint name is required'
      )

      return
    }


    if (!formData.startDate) {

      setFormError(
        'Start date is required'
      )

      return
    }


    if (!formData.endDate) {

      setFormError(
        'End date is required'
      )

      return
    }


    if (!formData.projectId) {

      setFormError(
        'Please select a project'
      )

      return
    }


    if (
      formData.endDate <
      formData.startDate
    ) {

      setFormError(
        'End date cannot be before start date'
      )

      return
    }


    try {

      setCreating(true)

      const response =
        await axios.post(
          'http://localhost:8080/api/sprints',
          {
            name:
              formData.name,

            startDate:
              formData.startDate,

            endDate:
              formData.endDate,

            status:
              formData.status,

            projectId:
              Number(
                formData.projectId
              ),
          },
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem('token')}`,

              'Content-Type':
                'application/json',
            },
          }
        )


      const newSprint = {
        ...response.data,
        progress: 0,
      }


      setSprints(
        (current) => [
          ...current,
          newSprint,
        ]
      )


      closeCreateForm()

      await fetchSprints()

    } catch (error) {

      console.error(
        'Create sprint error:',
        error
      )

      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        navigate('/login')

      } else if (
        error.response?.status === 403
      ) {

        setFormError(
          'Only ADMIN can create sprints.'
        )

      } else if (
        error.response?.data?.message
      ) {

        setFormError(
          error.response.data.message
        )

      } else {

        setFormError(
          'Unable to create sprint.'
        )
      }

    } finally {

      setCreating(false)
    }
  }


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEdit = (sprint) => {

    setEditingSprint(sprint)

    setFormData({
      name:
        sprint.name || '',

      startDate:
        sprint.startDate || '',

      endDate:
        sprint.endDate || '',

      status:
        sprint.status || 'ACTIVE',

      projectId:
        sprint.project?.id
          ? String(
              sprint.project.id
            )
          : '',
    })

    setFormError('')

    setShowCreateForm(false)
    setShowEditForm(true)
  }


  // ==========================================
  // UPDATE SPRINT
  // ==========================================

  const handleUpdateSprint = async (
    event
  ) => {

    event.preventDefault()

    setFormError('')


    if (!editingSprint) {

      setFormError(
        'No sprint selected for editing.'
      )

      return
    }


    if (!formData.name.trim()) {

      setFormError(
        'Sprint name is required'
      )

      return
    }


    if (!formData.startDate) {

      setFormError(
        'Start date is required'
      )

      return
    }


    if (!formData.endDate) {

      setFormError(
        'End date is required'
      )

      return
    }


    if (!formData.projectId) {

      setFormError(
        'Please select a project'
      )

      return
    }


    if (
      formData.endDate <
      formData.startDate
    ) {

      setFormError(
        'End date cannot be before start date'
      )

      return
    }


    try {

      setUpdating(true)

      await axios.put(
        `http://localhost:8080/api/sprints/${editingSprint.id}`,
        {
          name:
            formData.name,

          startDate:
            formData.startDate,

          endDate:
            formData.endDate,

          status:
            formData.status,

          projectId:
            Number(
              formData.projectId
            ),
        },
        getAuthConfig()
      )


      closeEditForm()

      await fetchSprints()

    } catch (error) {

      console.error(
        'Update sprint error:',
        error
      )

      if (
        handleUnauthorized(error)
      ) {

        return
      }


      if (
        error.response?.status === 403
      ) {

        setFormError(
          'Only ADMIN can edit sprints.'
        )

      } else if (
        error.response?.data?.message
      ) {

        setFormError(
          error.response.data.message
        )

      } else {

        setFormError(
          'Unable to update sprint.'
        )
      }

    } finally {

      setUpdating(false)
    }
  }


  // ==========================================
  // DELETE SPRINT
  // ==========================================

  const handleDelete = async (
    sprintId
  ) => {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this sprint?'
      )


    if (!confirmed) {
      return
    }


    try {

      await axios.delete(
        `http://localhost:8080/api/sprints/${sprintId}`,
        getAuthConfig()
      )


      setSprints(
        (current) =>
          current.filter(
            (sprint) =>
              sprint.id !== sprintId
          )
      )

    } catch (error) {

      console.error(
        'Delete sprint error:',
        error
      )


      if (
        handleUnauthorized(error)
      ) {

        return
      }


      if (
        error.response?.status === 403
      ) {

        alert(
          'Only ADMIN can delete sprints.'
        )

      } else {

        alert(
          'Unable to delete sprint'
        )
      }
    }
  }


  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (
    status
  ) => {

    if (!status) {
      return 'status-default'
    }

    return `status-${status
      .toLowerCase()
      .replace(/\s+/g, '-')}`
  }


  // ==========================================
  // SPRINT FORM
  // ==========================================

  const renderSprintForm = (
    isEdit = false
  ) => {

    return (
      <div className="sprint-form-overlay">

        <div className="sprint-form-card">

          <div className="sprint-form-header">

            <div>

              <h2>
                {isEdit
                  ? 'Edit Sprint'
                  : 'Create New Sprint'}
              </h2>

              <p>
                {isEdit
                  ? 'Update your sprint details.'
                  : 'Add a new sprint to your project.'}
              </p>

            </div>


            <button
              type="button"
              className="close-form-button"
              onClick={
                isEdit
                  ? closeEditForm
                  : closeCreateForm
              }
            >
              <X size={20} />
            </button>

          </div>


          <form
            onSubmit={
              isEdit
                ? handleUpdateSprint
                : handleCreateSprint
            }
          >

            {/* SPRINT NAME */}

            <div className="form-group">

              <label>
                Sprint Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="e.g. Sprint 2"
                value={
                  formData.name
                }
                onChange={
                  handleInputChange
                }
              />

            </div>


            {/* DATES */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={
                    formData.startDate
                  }
                  onChange={
                    handleInputChange
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={
                    formData.endDate
                  }
                  onChange={
                    handleInputChange
                  }
                />

              </div>

            </div>


            {/* STATUS + PROJECT */}

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

                <label>
                  Project
                </label>

                <select
                  name="projectId"
                  value={
                    formData.projectId
                  }
                  onChange={
                    handleInputChange
                  }
                >

                  <option value="">
                    Select project
                  </option>

                  {projects.map(
                    (project) => (

                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name}
                      </option>

                    )
                  )}

                </select>

              </div>

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
                  isEdit
                    ? closeEditForm
                    : closeCreateForm
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="create-sprint-button"
                disabled={
                  isEdit
                    ? updating
                    : creating
                }
              >

                {isEdit
                  ? <Edit size={18} />
                  : <Plus size={18} />}

                {isEdit
                  ? (
                    updating
                      ? 'Updating...'
                      : 'Update Sprint'
                  )
                  : (
                    creating
                      ? 'Creating...'
                      : 'Create Sprint'
                  )}

              </button>

            </div>

          </form>

        </div>

      </div>
    )
  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="dashboard-layout">


      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <BrainCircuit size={26} />
          </div>

          <div>
            <h2>SprintIQ</h2>

            <span>
              Agile Intelligence
            </span>
          </div>

        </div>


        <nav className="nav-menu">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard size={20} />

            <span>
              Dashboard
            </span>
          </NavLink>


          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <FolderKanban size={20} />

            <span>
              Projects
            </span>
          </NavLink>


          <NavLink
            to="/sprints"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <CalendarDays size={20} />

            <span>
              Sprints
            </span>
          </NavLink>


          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <ListTodo size={20} />

            <span>
              Tasks
            </span>
          </NavLink>


          <NavLink
            to="/ai-insights"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <BrainCircuit size={20} />

            <span>
              AI Insights
            </span>
          </NavLink>

        </nav>


        <div className="sidebar-bottom">

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Settings size={20} />

            <span>
              Settings
            </span>
          </NavLink>


          <button
            type="button"
            className="nav-item logout-button"
            onClick={handleLogout}
          >

            <LogOut size={20} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main className="main-content">


        <header className="topbar">

          <div>

            <h1>
              Sprints
            </h1>

            <p>
              Manage your Agile sprints
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


        <section className="sprints-content">


          {/* ========================================
              HEADER
          ======================================== */}

          <div className="sprints-header">

            <div>

              <span className="eyebrow">
                SPRINT MANAGEMENT
              </span>

              <h2>
                {selectedProjectId
                  ? (
                    projects.find(
                      (project) =>
                        String(project.id) ===
                        String(selectedProjectId)
                    )?.name ||
                    'Project Sprints'
                  )
                  : 'Your Sprints'}
              </h2>

              <p>
                {selectedProjectId
                  ? 'View and manage sprints for this project.'
                  : 'View and manage your team’s sprint cycles.'}
              </p>

            </div>


            {/* ADMIN ONLY */}

            {user.role === 'ADMIN' && (

              <button
                type="button"
                className="create-sprint-button"
                onClick={openCreateForm}
              >

                <Plus size={18} />

                New Sprint

              </button>

            )}

          </div>


          {/* ========================================
              CREATE FORM
          ======================================== */}

          {showCreateForm &&
            renderSprintForm(false)}


          {/* ========================================
              EDIT FORM
          ======================================== */}

          {showEditForm &&
            renderSprintForm(true)}


          {/* ========================================
              LOADING
          ======================================== */}

          {loading && (

            <div className="dashboard-loading">
              Loading sprints...
            </div>

          )}


          {/* ========================================
              ERROR
          ======================================== */}

          {!loading &&
            error && (

              <div className="dashboard-error">
                {error}
              </div>

            )}


          {/* ========================================
              EMPTY
          ======================================== */}

          {!loading &&
            !error &&
            sprints.length === 0 && (

              <div className="empty-sprints">

                <CalendarDays size={48} />

                <h3>
                  No sprints yet
                </h3>

                <p>
                  {selectedProjectId
                    ? 'This project has no sprints yet.'
                    : 'Create your first sprint to start managing your team’s work.'}
                </p>


                {user.role === 'ADMIN' && (

                  <button
                    type="button"
                    className="create-sprint-button"
                    onClick={openCreateForm}
                  >

                    <Plus size={18} />

                    Create Sprint

                  </button>

                )}

              </div>

            )}


          {/* ========================================
              SPRINT CARDS
          ======================================== */}

          {!loading &&
            !error &&
            sprints.length > 0 && (

              <div className="sprints-grid">

                {sprints.map(
                  (sprint) => {

                    const progress =
                      Math.max(
                        0,
                        Math.min(
                          100,
                          Number(
                            sprint.progress ?? 0
                          )
                        )
                      )


                    return (

                      <div
                        className="sprint-card"
                        key={sprint.id}
                        onClick={() =>
                          handleSprintClick(
                            sprint
                          )
                        }
                      >


                        {/* TOP */}

                        <div className="sprint-card-top">

                          <div className="sprint-icon">

                            <CalendarDays
                              size={24}
                            />

                          </div>


                          <span
                            className={`sprint-status ${getStatusClass(
                              sprint.status
                            )}`}
                          >
                            {sprint.status ||
                              'ACTIVE'}
                          </span>

                        </div>


                        {/* NAME */}

                        <h3>
                          {sprint.name}
                        </h3>


                        {/* PROJECT */}

                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '13px',
                            color: '#64748b',
                          }}
                        >
                          {sprint.project?.name ||
                            'No project'}
                        </div>


                        {/* DATES */}

                        <div className="sprint-dates">

                          <div>

                            <span>
                              Start
                            </span>

                            <strong>
                              {sprint.startDate ||
                                'Not set'}
                            </strong>

                          </div>


                          <div>

                            <span>
                              End
                            </span>

                            <strong>
                              {sprint.endDate ||
                                'Not set'}
                            </strong>

                          </div>

                        </div>


                        {/* PROGRESS */}

                        <div
                          style={{
                            marginTop:
                              '18px',
                          }}
                        >

                          <div
                            style={{
                              display:
                                'flex',
                              justifyContent:
                                'space-between',
                              alignItems:
                                'center',
                              marginBottom:
                                '8px',
                            }}
                          >

                            <span
                              style={{
                                fontSize:
                                  '13px',
                                fontWeight:
                                  '600',
                              }}
                            >
                              Progress
                            </span>


                            <span
                              style={{
                                fontSize:
                                  '13px',
                                fontWeight:
                                  '700',
                              }}
                            >
                              {progress}%
                            </span>

                          </div>


                          <div
                            style={{
                              width:
                                '100%',
                              height:
                                '8px',
                              background:
                                '#e5e7eb',
                              borderRadius:
                                '999px',
                              overflow:
                                'hidden',
                            }}
                          >

                            <div
                              style={{
                                width:
                                  `${progress}%`,
                                height:
                                  '100%',
                                borderRadius:
                                  '999px',
                                background:
                                  'currentColor',
                                transition:
                                  'width 0.3s ease',
                              }}
                            />

                          </div>


                          {progress ===
                            100 && (

                            <div
                              style={{
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                gap:
                                  '5px',
                                marginTop:
                                  '7px',
                                fontSize:
                                  '12px',
                              }}
                            >

                              <CheckCircle2
                                size={14}
                              />

                              Sprint completed

                            </div>

                          )}

                        </div>


                        {/* FOOTER */}

                        <div className="sprint-card-footer">

                          <span>
                            {sprint.project?.name ||
                              'No project'}
                          </span>


                          {user.role ===
                            'ADMIN' && (

                            <div
                              style={{
                                display:
                                  'flex',
                                gap:
                                  '8px',
                                alignItems:
                                  'center',
                              }}
                            >

                              {/* EDIT */}

                              <button
                                type="button"
                                className="edit-sprint-button"
                                onClick={(
                                  event
                                ) => {

                                  event.stopPropagation()

                                  handleEdit(
                                    sprint
                                  )

                                }}
                                title="Edit sprint"
                              >

                                <Edit
                                  size={17}
                                />

                              </button>


                              {/* DELETE */}

                              <button
                                type="button"
                                className="delete-sprint-button"
                                onClick={(
                                  event
                                ) => {

                                  event.stopPropagation()

                                  handleDelete(
                                    sprint.id
                                  )

                                }}
                                title="Delete sprint"
                              >

                                <Trash2
                                  size={17}
                                />

                              </button>

                            </div>

                          )}

                        </div>

                      </div>

                    )
                  }
                )}

              </div>

            )}

        </section>

      </main>

    </div>
  )
}

export default Sprints