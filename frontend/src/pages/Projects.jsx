import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
  Users,
  UserPlus,
  UserMinus,
} from 'lucide-react'

import '../App.css'

function Projects() {
  const navigate = useNavigate()

  const [user, setUser] = useState({})
  const isAdmin = user.role === 'ADMIN'
  const [projects, setProjects] = useState([])
  const [allUsers, setAllUsers] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  // Team members
  const [teamMembers, setTeamMembers] = useState({})
  const [selectedMembers, setSelectedMembers] = useState({})
  const [memberLoading, setMemberLoading] = useState({})
  const [memberError, setMemberError] = useState({})

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

  const getAuthConfig = () => {
    const token = localStorage.getItem('token')

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

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
  // LOAD PROJECTS + SPRINTS + TASKS + USERS
  // ==========================================

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError('')

      const config = getAuthConfig()

      const [
        projectsResponse,
        sprintsResponse,
        tasksResponse,
        usersResponse,
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

        axios.get(
          'http://localhost:8080/api/users',
          config
        ),
      ])

      const projectsData = projectsResponse.data
      const sprints = sprintsResponse.data
      const tasks = tasksResponse.data
      const users = usersResponse.data

      setAllUsers(users)

      const projectsWithCounts = projectsData.map(
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

      // Load team members for every project
      projectsWithCounts.forEach((project) => {
        fetchTeamMembers(project.id)
      })
    } catch (error) {
      console.error(
        'Projects API error:',
        error
      )

      if (!handleUnauthorized(error)) {
        setError('Unable to load projects')
      }
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // TEAM MEMBERS
  // ==========================================

  const fetchTeamMembers = async (projectId) => {
    try {
      setMemberError((current) => ({
        ...current,
        [projectId]: '',
      }))

      const response = await axios.get(
        `http://localhost:8080/api/projects/${projectId}/members`,
        getAuthConfig()
      )

      setTeamMembers((current) => ({
        ...current,
        [projectId]: response.data,
      }))
    } catch (error) {
  console.error(
    'Team members API error:',
    error
  )

  if (error.response?.status === 401) {
    handleUnauthorized(error)
    return
  }

  if (error.response?.status === 403) {
    setMemberError((current) => ({
      ...current,
      [projectId]: '',
    }))
    return
  }

  setMemberError((current) => ({
    ...current,
    [projectId]:
      'Unable to load team members',
  }))
}
  }

  const handleMemberChange = (
    projectId,
    userId
  ) => {
    setSelectedMembers((current) => ({
      ...current,
      [projectId]: userId,
    }))

    setMemberError((current) => ({
      ...current,
      [projectId]: '',
    }))
  }

  const handleAddMember = async (projectId) => {
    const userId = selectedMembers[projectId]

    if (!userId) {
      setMemberError((current) => ({
        ...current,
        [projectId]:
          'Please select a user',
      }))
      return
    }

    try {
      setMemberLoading((current) => ({
        ...current,
        [projectId]: true,
      }))

      setMemberError((current) => ({
        ...current,
        [projectId]: '',
      }))

      await axios.post(
        `http://localhost:8080/api/projects/${projectId}/members/${userId}`,
        {},
        getAuthConfig()
      )

      setSelectedMembers((current) => ({
        ...current,
        [projectId]: '',
      }))

      await fetchTeamMembers(projectId)
    } catch (error) {
      console.error(
        'Add member error:',
        error
      )

      if (!handleUnauthorized(error)) {
        if (error.response?.status === 404) {
          setMemberError((current) => ({
            ...current,
            [projectId]:
              'User not found',
          }))
        } else if (
          error.response?.status === 409
        ) {
          setMemberError((current) => ({
            ...current,
            [projectId]:
              'User is already a team member',
          }))
        } else {
          setMemberError((current) => ({
            ...current,
            [projectId]:
              'Unable to add team member',
          }))
        }
      }
    } finally {
      setMemberLoading((current) => ({
        ...current,
        [projectId]: false,
      }))
    }
  }

  const handleRemoveMember = async (
    projectId,
    userId
  ) => {
    const confirmed = window.confirm(
      'Remove this member from the project?'
    )

    if (!confirmed) {
      return
    }

    try {
      setMemberLoading((current) => ({
        ...current,
        [projectId]: true,
      }))

      setMemberError((current) => ({
        ...current,
        [projectId]: '',
      }))

      await axios.delete(
        `http://localhost:8080/api/projects/${projectId}/members/${userId}`,
        getAuthConfig()
      )

      await fetchTeamMembers(projectId)
    } catch (error) {
      console.error(
        'Remove member error:',
        error
      )

      if (!handleUnauthorized(error)) {
        setMemberError((current) => ({
          ...current,
          [projectId]:
            'Unable to remove team member',
        }))
      }
    } finally {
      setMemberLoading((current) => ({
        ...current,
        [projectId]: false,
      }))
    }
  }

  // ==========================================
  // PROJECT FORM
  // ==========================================

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
      setFormError(
        'Project name is required'
      )
      return
    }

    try {
      setCreating(true)

      const response = await axios.post(
        'http://localhost:8080/api/projects',
        {
          name: formData.name,
          description: formData.description,
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

      const newProject = {
        ...response.data,
        sprintCount: 0,
        taskCount: 0,
      }

      setProjects((current) => [
        ...current,
        newProject,
      ])

      setTeamMembers((current) => ({
        ...current,
        [newProject.id]: [],
      }))

      setSelectedMembers((current) => ({
        ...current,
        [newProject.id]: '',
      }))

      setFormData({
        name: '',
        description: '',
      })

      setShowCreateForm(false)
    } catch (error) {
      console.error(
        'Create project error:',
        error
      )

      if (!handleUnauthorized(error)) {
        setFormError(
          'Unable to create project'
        )
      }
    } finally {
      setCreating(false)
    }
  }

  // ==========================================
  // DELETE PROJECT
  // ==========================================

  const handleDeleteProject = async (
    projectId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    )

    if (!confirmed) {
      return
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/projects/${projectId}`,
        getAuthConfig()
      )

      setProjects((current) =>
        current.filter(
          (project) =>
            project.id !== projectId
        )
      )

      setTeamMembers((current) => {
        const updated = {
          ...current,
        }

        delete updated[projectId]

        return updated
      })
    } catch (error) {
      console.error(
        'Delete project error:',
        error
      )

      if (!handleUnauthorized(error)) {
        alert(
          'Unable to delete project. It may contain sprints or tasks.'
        )
      }
    }
  }

  const getProjectSprintCount = (
    project
  ) => {
    return project.sprintCount ?? 0
  }

  const getProjectTaskCount = (
    project
  ) => {
    return project.taskCount ?? 0
  }
const handleProjectClick = (project) => {
  navigate(`/sprints?projectId=${project.id}`)
}
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  // ==========================================
  // UI
  // ==========================================

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
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <FolderKanban size={20} />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/sprints"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <CalendarDays size={20} />
            <span>Sprints</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <ListTodo size={20} />
            <span>Tasks</span>
          </NavLink>

          <NavLink
            to="/ai-insights"
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <BrainCircuit size={20} />
            <span>AI Insights</span>
          </NavLink>

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

        {/* TOP BAR */}

        <header className="topbar">

          <div>
            <h1>Projects</h1>
            <p>
              Manage your Agile projects
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

        {/* CONTENT */}

        <section className="projects-content">

          {/* PAGE HEADER */}

          <div className="projects-header">

            <div>

              <span className="eyebrow">
                PROJECT MANAGEMENT
              </span>

              <h2>
                Your Projects
              </h2>

              <p>
                Create and manage your
                Agile projects.
              </p>

            </div>

            {isAdmin && (
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
)}

          </div>

          {/* CREATE PROJECT FORM */}

          {showCreateForm && (

            <div className="sprint-form-overlay">

              <div className="sprint-form-card">

                <div className="sprint-form-header">

                  <div>

                    <h2>
                      Create New Project
                    </h2>

                    <p>
                      Add a new project to
                      SprintIQ.
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
                  onSubmit={handleCreateProject}
                >

                  <div className="form-group">

                    <label>
                      Project Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. SprintIQ"
                      value={formData.name}
                      onChange={
                        handleInputChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Description
                    </label>

                    <textarea
                      name="description"
                      placeholder="Describe your project..."
                      value={
                        formData.description
                      }
                      onChange={
                        handleInputChange
                      }
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

              {projects.map((project) => {

                const members =
                  teamMembers[project.id] || []

                const currentMemberError =
                  memberError[project.id]

                const isMemberLoading =
                  memberLoading[project.id]

                const selectedUserId =
                  selectedMembers[project.id] || ''

                // Users who are not already
                // project members
                const availableUsers =
                  allUsers.filter(
                    (availableUser) =>
                      !members.some(
                        (member) =>
                          member.id ===
                          availableUser.id
                      )
                  )

                return (

                  <div
  className="project-card"
  key={project.id}
  onClick={() => handleProjectClick(project)}
  style={{ cursor: 'pointer' }}
>

                    {/* PROJECT TOP */}

                    <div className="project-card-top">

                      <div className="project-icon">
                        <Folder size={24} />
                      </div>

                      {isAdmin && (
  <button
    type="button"
    className="project-delete-button"
    onClick={(event) => {
  event.stopPropagation()
  handleDeleteProject(project.id)
}}
    title="Delete project"
  >
    <Trash2 size={17} />
  </button>
)}

                    </div>

                    <h3>
                      {project.name}
                    </h3>

                    <p className="project-description">
                      {project.description ||
                        'No description provided.'}
                    </p>

                    {/* PROJECT STATS */}

                    <div className="project-stats">

                      <div>

                        <CalendarCheck
                          size={17}
                        />

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

                        <ListChecks
                          size={17}
                        />

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

                    {/* TEAM MEMBERS */}

                    <div
                      className="project-team-section"
                      style={{
                        marginTop: '20px',
                        paddingTop: '18px',
                        borderTop:
                          '1px solid #e5e7eb',
                      }}
                    >

                      {/* TEAM HEADER */}

                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: '8px',
                          marginBottom:
                            '14px',
                        }}
                      >

                        <Users size={18} />

                        <strong>
                          Team Members
                        </strong>

                        <span
                          style={{
                            marginLeft:
                              'auto',
                            fontSize:
                              '13px',
                            color:
                              '#64748b',
                          }}
                        >
                          {members.length}
                        </span>

                      </div>

                      {/* MEMBER LIST */}

                      {members.length > 0 ? (

                        <div
                          style={{
                            display: 'flex',
                            flexDirection:
                              'column',
                            gap: '10px',
                          }}
                        >

                          {members.map(
                            (member) => (

                              <div
                                key={member.id}
                                style={{
                                  display:
                                    'flex',
                                  alignItems:
                                    'center',
                                  gap: '10px',
                                  padding:
                                    '8px',
                                  borderRadius:
                                    '8px',
                                  background:
                                    '#f8fafc',
                                }}
                              >

                                <div
                                  style={{
                                    width:
                                      '34px',
                                    height:
                                      '34px',
                                    borderRadius:
                                      '50%',
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center',
                                    background:
                                      '#e0e7ff',
                                    color:
                                      '#4f46e5',
                                    fontWeight:
                                      '600',
                                    flexShrink: 0,
                                  }}
                                >
                                  {(member.name ||
                                    'U')
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div
                                  style={{
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >

                                  <div
                                    style={{
                                      fontWeight:
                                        '600',
                                      fontSize:
                                        '14px',
                                    }}
                                  >
                                    {member.name}
                                  </div>

                                  <div
                                    style={{
                                      fontSize:
                                        '12px',
                                      color:
                                        '#64748b',
                                      overflow:
                                        'hidden',
                                      textOverflow:
                                        'ellipsis',
                                      whiteSpace:
                                        'nowrap',
                                    }}
                                  >
                                    {member.email}
                                  </div>

                                </div>

                                {isAdmin && (
  <button
    type="button"
    onClick={(event) => {
  event.stopPropagation()
  handleRemoveMember(
    project.id,
    member.id
  )
}}

    disabled={isMemberLoading}
    title="Remove member"
    style={{
      border: 'none',
      background: '#fee2e2',
      color: '#dc2626',
      borderRadius: '7px',
      padding: '7px',
      cursor: isMemberLoading
        ? 'not-allowed'
        : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <UserMinus size={15} />
  </button>
)}

                              </div>

                            )
                          )}

                        </div>

                      ) : (

                        <p
                          style={{
                            fontSize:
                              '13px',
                            color:
                              '#64748b',
                            marginBottom:
                              '12px',
                          }}
                        >
                          No team members yet.
                        </p>

                      )}

                      {/* ADD MEMBER */}
                      {isAdmin &&(
                      <div
                        style={{
                          display:
                            'flex',
                          gap: '8px',
                          marginTop:
                            '12px',
                        }}
                      >

                        <select
  value={selectedUserId}
  onClick={(event) => event.stopPropagation()}
  onChange={(event) =>
    handleMemberChange(
      project.id,
      event.target.value
    )
  }
                          disabled={
                            isMemberLoading ||
                            availableUsers.length === 0
                          }
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding:
                              '9px 10px',
                            border:
                              '1px solid #cbd5e1',
                            borderRadius:
                              '7px',
                            outline:
                              'none',
                            background:
                              'white',
                            color:
                              '#334155',
                          }}
                        >

                          <option value="">
                            {availableUsers.length === 0
                              ? 'No users available'
                              : 'Select team member'}
                          </option>

                          {availableUsers.map(
                            (availableUser) => (

                              <option
                                key={
                                  availableUser.id
                                }
                                value={
                                  availableUser.id
                                }
                              >
                                {availableUser.name}
                                {' — '}
                                {availableUser.email}
                              </option>

                            )
                          )}

                        </select>

                        <button
                          type="button"
                          onClick={(event) => {
  event.stopPropagation()
  handleAddMember(project.id)
}}
                          disabled={
                            isMemberLoading ||
                            !selectedUserId
                          }
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: '5px',
                            border:
                              'none',
                            borderRadius:
                              '7px',
                            padding:
                              '9px 12px',
                            background:
                              !selectedUserId ||
                              isMemberLoading
                                ? '#a5b4fc'
                                : '#4f46e5',
                            color:
                              'white',
                            fontWeight:
                              '600',
                            cursor:
                              !selectedUserId ||
                              isMemberLoading
                                ? 'not-allowed'
                                : 'pointer',
                          }}
                        >

                          <UserPlus
                            size={15}
                          />

                          {isMemberLoading
                            ? '...'
                            : 'Add'}

                        </button>

                      </div>)}

                      {/* MEMBER ERROR */}

                      {currentMemberError && (

                        <div
                          style={{
                            color:
                              '#dc2626',
                            fontSize:
                              '12px',
                            marginTop:
                              '8px',
                          }}
                        >
                          {currentMemberError}
                        </div>

                      )}

                    </div>

                    {/* PROJECT FOOTER */}

                   
                  </div>
                )
              })}

              {/* EMPTY STATE */}

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