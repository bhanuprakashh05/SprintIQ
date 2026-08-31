import { useEffect, useState } from 'react'
import {
  NavLink,
  Link,
  useNavigate,
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
  Users,
  CheckCircle2,
  Clock3,
  ArrowRight,
  UserPlus,
  Plus,
} from 'lucide-react'

import '../App.css'

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState({})

  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [sprints, setSprints] = useState([])
  const [tasks, setTasks] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ==========================================
  // AUTH CONFIG
  // ==========================================

  const getAuthConfig = () => {
    const token = localStorage.getItem('token')

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setError('')

      const config = getAuthConfig()

      const [
        projectsResponse,
        usersResponse,
        sprintsResponse,
        tasksResponse,
      ] = await Promise.all([
        axios.get(
          'http://localhost:8080/api/projects',
          config
        ),

        axios.get(
          'http://localhost:8080/api/users',
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

      setProjects(projectsResponse.data || [])
      setUsers(usersResponse.data || [])
      setSprints(sprintsResponse.data || [])
      setTasks(tasksResponse.data || [])
    } catch (error) {
      console.error(
        'Dashboard error:',
        error
      )

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }

      setError(
        'Unable to load dashboard data'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem('user') || '{}'
      )

      setUser(storedUser)
    } catch {
      setUser({})
    }

    fetchDashboardData()
  }, [])

  // ==========================================
  // REFRESH WHEN RETURNING TO DASHBOARD
  // ==========================================

  useEffect(() => {
    const handleFocus = () => {
      if (
        window.location.pathname ===
        '/dashboard'
      ) {
        fetchDashboardData()
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
  }, [])

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login', {
      replace: true,
    })
  }

  // ==========================================
  // TASK STATISTICS
  // ==========================================

  const totalTasks = tasks.length

  const completedTasks = tasks.filter(
    (task) =>
      task.status === 'DONE'
  ).length

  const inProgressTasks = tasks.filter(
    (task) =>
      task.status === 'IN_PROGRESS'
  ).length

  const todoTasks = tasks.filter(
    (task) =>
      task.status === 'TODO'
  ).length

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks * 100) /
            totalTasks
        )

  // ==========================================
  // PROJECT INFORMATION
  // ==========================================

  const getProjectSprints = (
    projectId
  ) => {
    return sprints.filter(
      (sprint) =>
        sprint.project?.id ===
        projectId
    )
  }

  const getProjectTasks = (
    projectId
  ) => {
    return tasks.filter(
      (task) =>
        task.project?.id ===
        projectId
    )
  }

  const getProjectMembers = (
    project
  ) => {
    return project.members || []
  }

  // ==========================================
  // UI
  // ==========================================

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
            <span>
              Agile Intelligence
            </span>
          </div>

        </div>

        <nav className="nav-menu">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-item ${
                isActive
                  ? 'active'
                  : ''
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `nav-item ${
                isActive
                  ? 'active'
                  : ''
              }`
            }
          >
            <FolderKanban size={20} />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/sprints"
            className={({ isActive }) =>
              `nav-item ${
                isActive
                  ? 'active'
                  : ''
              }`
            }
          >
            <CalendarDays size={20} />
            <span>Sprints</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `nav-item ${
                isActive
                  ? 'active'
                  : ''
              }`
            }
          >
            <ListTodo size={20} />
            <span>Tasks</span>
          </NavLink>

          <NavLink
            to="/ai-insights"
            className={({ isActive }) =>
              `nav-item ${
                isActive
                  ? 'active'
                  : ''
              }`
            }
          >
            <BrainCircuit size={20} />
            <span>AI Insights</span>
          </NavLink>

        </nav>

        <div className="sidebar-bottom">

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${
                isActive
                  ? 'active'
                  : ''
              }`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>

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

        {/* TOP BAR */}

        <header className="topbar">

          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back to SprintIQ
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

        {/* =====================================================
            DASHBOARD CONTENT
        ===================================================== */}

        <section className="dashboard-content">

          {/* =================================================
              WELCOME
          ================================================= */}

          <div className="welcome-card">

            <div>

              <span className="eyebrow">
                SPRINTIQ OVERVIEW
              </span>

              <h2>
                Welcome back,{' '}
                {user.name || 'User'} 👋
              </h2>

              <p>
                Here's a quick overview of
                your SprintIQ workspace.
              </p>

            </div>

            <BrainCircuit
              size={70}
              className="welcome-icon"
            />

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* =================================================
              OVERVIEW STATS
          ================================================= */}

          <div className="stats-section">

            <div className="section-heading">

              <div>
                <h2>
                  Workspace Overview
                </h2>

                <p>
                  Everything happening across
                  your workspace.
                </p>
              </div>

            </div>

            {loading ? (

              <div className="dashboard-loading">
                Loading workspace...
              </div>

            ) : (

              <div className="stats-grid">

                {/* PROJECTS */}

                <div className="stat-card">

                  <div className="stat-icon total">
                    <FolderKanban
                      size={24}
                    />
                  </div>

                  <div>
                    <span>
                      Projects
                    </span>

                    <strong>
                      {projects.length}
                    </strong>
                  </div>

                </div>

                {/* MEMBERS */}

                <div className="stat-card">

                  <div className="stat-icon progress">
                    <Users size={24} />
                  </div>

                  <div>
                    <span>
                      Members
                    </span>

                    <strong>
                      {users.length}
                    </strong>
                  </div>

                </div>

                {/* SPRINTS */}

                <div className="stat-card">

                  <div className="stat-icon todo">
                    <CalendarDays
                      size={24}
                    />
                  </div>

                  <div>
                    <span>
                      Sprints
                    </span>

                    <strong>
                      {sprints.length}
                    </strong>
                  </div>

                </div>

                {/* TASKS */}

                <div className="stat-card">

                  <div className="stat-icon completed">
                    <ListTodo
                      size={24}
                    />
                  </div>

                  <div>
                    <span>
                      Tasks
                    </span>

                    <strong>
                      {totalTasks}
                    </strong>
                  </div>

                </div>

              </div>

            )}

          </div>

          {/* =================================================
              MAIN DASHBOARD GRID
          ================================================= */}

          {!loading && (

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'minmax(0, 2fr) minmax(280px, 1fr)',
                gap: '24px',
                marginTop: '24px',
              }}
            >

              {/* =============================================
                  PROJECTS
              ============================================= */}

              <div className="settings-card">

                <div className="settings-card-header">

                  <div className="settings-card-icon">
                    <FolderKanban
                      size={22}
                    />
                  </div>

                  <div>
                    <h3>
                      Your Projects
                    </h3>

                    <p>
                      Overview of your projects
                    </p>
                  </div>

                  <Link
                    to="/projects"
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      textDecoration:
                        'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#4f46e5',
                    }}
                  >
                    View All
                    <ArrowRight
                      size={15}
                    />
                  </Link>

                </div>

                <div
                  style={{
                    marginTop: '18px',
                    display: 'flex',
                    flexDirection:
                      'column',
                    gap: '12px',
                  }}
                >

                  {projects.length === 0 ? (

                    <div
                      style={{
                        padding: '25px',
                        textAlign: 'center',
                        color: '#64748b',
                      }}
                    >
                      No projects available.
                    </div>

                  ) : (

                    projects
                      .slice(0, 5)
                      .map((project) => {

                        const projectSprints =
                          getProjectSprints(
                            project.id
                          )

                        const projectTasks =
                          getProjectTasks(
                            project.id
                          )

                        const projectMembers =
                          getProjectMembers(
                            project
                          )

                        const projectCompleted =
                          projectTasks.filter(
                            (task) =>
                              task.status ===
                              'DONE'
                          ).length

                        const projectCompletion =
                          projectTasks.length ===
                          0
                            ? 0
                            : Math.round(
                                (projectCompleted *
                                  100) /
                                  projectTasks.length
                              )

                        return (

                          <div
                            key={project.id}
                            onClick={() =>
                              navigate(
                                `/sprints?projectId=${project.id}`
                              )
                            }
                            style={{
                              border:
                                '1px solid #e2e8f0',
                              borderRadius:
                                '10px',
                              padding:
                                '16px',
                              cursor:
                                'pointer',
                              background:
                                'white',
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
                              }}
                            >

                              <div>

                                <h4
                                  style={{
                                    margin:
                                      '0 0 5px',
                                  }}
                                >
                                  {project.name}
                                </h4>

                                <p
                                  style={{
                                    margin: 0,
                                    fontSize:
                                      '13px',
                                    color:
                                      '#64748b',
                                  }}
                                >
                                  {
                                    project.description ||
                                    'No description'
                                  }
                                </p>

                              </div>

                              <ArrowRight
                                size={18}
                              />

                            </div>

                            <div
                              style={{
                                display:
                                  'flex',
                                gap: '18px',
                                marginTop:
                                  '14px',
                                fontSize:
                                  '13px',
                                color:
                                  '#64748b',
                              }}
                            >

                              <span>
                                <Users
                                  size={14}
                                  style={{
                                    verticalAlign:
                                      'middle',
                                    marginRight:
                                      '4px',
                                  }}
                                />
                                {
                                  projectMembers.length
                                }{' '}
                                members
                              </span>

                              <span>
                                <CalendarDays
                                  size={14}
                                  style={{
                                    verticalAlign:
                                      'middle',
                                    marginRight:
                                      '4px',
                                  }}
                                />
                                {
                                  projectSprints.length
                                }{' '}
                                sprints
                              </span>

                              <span>
                                <ListTodo
                                  size={14}
                                  style={{
                                    verticalAlign:
                                      'middle',
                                    marginRight:
                                      '4px',
                                  }}
                                />
                                {
                                  projectTasks.length
                                }{' '}
                                tasks
                              </span>

                            </div>

                            <div
                              style={{
                                marginTop:
                                  '14px',
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    'flex',
                                  justifyContent:
                                    'space-between',
                                  marginBottom:
                                    '6px',
                                  fontSize:
                                    '12px',
                                  color:
                                    '#64748b',
                                }}
                              >

                                <span>
                                  Task Progress
                                </span>

                                <strong>
                                  {
                                    projectCompletion
                                  }%
                                </strong>

                              </div>

                              <div
                                style={{
                                  width:
                                    '100%',
                                  height:
                                    '7px',
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
                                      `${projectCompletion}%`,
                                    height:
                                      '100%',
                                    background:
                                      '#4f46e5',
                                    borderRadius:
                                      '999px',
                                  }}
                                />

                              </div>

                            </div>

                          </div>

                        )
                      })

                  )}

                </div>

              </div>

              {/* =============================================
                  QUICK ACTIONS
              ============================================= */}

              <div className="settings-card">

                <div className="settings-card-header">

                  <div className="settings-card-icon">
                    <Plus size={22} />
                  </div>

                  <div>

                    <h3>
                      Quick Actions
                    </h3>

                    <p>
                      Manage your workspace
                    </p>

                  </div>

                </div>

                <div
                  style={{
                    display:
                      'flex',
                    flexDirection:
                      'column',
                    gap: '10px',
                    marginTop:
                      '18px',
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        '/projects'
                      )
                    }
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: '10px',
                      padding:
                        '13px',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius:
                        '8px',
                      background:
                        'white',
                      cursor:
                        'pointer',
                      textAlign:
                        'left',
                      fontWeight:
                        '600',
                    }}
                  >

                    <FolderKanban
                      size={18}
                    />

                    <span>
                      View Projects
                    </span>

                    <ArrowRight
                      size={16}
                      style={{
                        marginLeft:
                          'auto',
                      }}
                    />

                  </button>

                  {user.role ===
                    'ADMIN' && (

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          '/settings'
                        )
                      }
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: '10px',
                        padding:
                          '13px',
                        border:
                          '1px solid #e2e8f0',
                        borderRadius:
                          '8px',
                        background:
                          'white',
                        cursor:
                          'pointer',
                        textAlign:
                          'left',
                        fontWeight:
                          '600',
                      }}
                    >

                      <UserPlus
                        size={18}
                      />

                      <span>
                        Manage Members
                      </span>

                      <ArrowRight
                        size={16}
                        style={{
                          marginLeft:
                            'auto',
                        }}
                      />

                    </button>

                  )}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        '/sprints'
                      )
                    }
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: '10px',
                      padding:
                        '13px',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius:
                        '8px',
                      background:
                        'white',
                      cursor:
                        'pointer',
                      textAlign:
                        'left',
                      fontWeight:
                        '600',
                    }}
                  >

                    <CalendarDays
                      size={18}
                    />

                    <span>
                      View Sprints
                    </span>

                    <ArrowRight
                      size={16}
                      style={{
                        marginLeft:
                          'auto',
                      }}
                    />

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        '/tasks'
                      )
                    }
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: '10px',
                      padding:
                        '13px',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius:
                        '8px',
                      background:
                        'white',
                      cursor:
                        'pointer',
                      textAlign:
                        'left',
                      fontWeight:
                        '600',
                    }}
                  >

                    <ListTodo
                      size={18}
                    />

                    <span>
                      View Tasks
                    </span>

                    <ArrowRight
                      size={16}
                      style={{
                        marginLeft:
                          'auto',
                      }}
                    />

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        '/ai-insights'
                      )
                    }
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: '10px',
                      padding:
                        '13px',
                        border:
                          '1px solid #e2e8f0',
                        borderRadius:
                          '8px',
                        background:
                          'white',
                        cursor:
                          'pointer',
                        textAlign:
                          'left',
                        fontWeight:
                          '600',
                    }}
                  >

                    <BrainCircuit
                      size={18}
                    />

                    <span>
                      AI Insights
                    </span>

                    <ArrowRight
                      size={16}
                      style={{
                        marginLeft:
                          'auto',
                      }}
                    />

                  </button>

                </div>

              </div>

            </div>

          )}

          {/* =================================================
              TASK PROGRESS
          ================================================= */}

          {!loading && (

            <div
              className="settings-card"
              style={{
                marginTop: '24px',
              }}
            >

              <div className="settings-card-header">

                <div className="settings-card-icon">
                  <CheckCircle2
                    size={22}
                  />
                </div>

                <div>
                  <h3>
                    Task Progress
                  </h3>

                  <p>
                    Overall workspace completion
                  </p>
                </div>

              </div>

              <div
                style={{
                  marginTop: '20px',
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
                      '9px',
                  }}
                >

                  <span
                    style={{
                      color:
                        '#64748b',
                      fontSize:
                        '14px',
                    }}
                  >
                    Completed{' '}
                    {completedTasks} of{' '}
                    {totalTasks} tasks
                  </span>

                  <strong>
                    {
                      completionPercentage
                    }%
                  </strong>

                </div>

                <div
                  style={{
                    width:
                      '100%',
                    height:
                      '11px',
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
                        `${completionPercentage}%`,
                      height:
                        '100%',
                      background:
                        '#4f46e5',
                      borderRadius:
                        '999px',
                      transition:
                        'width 0.3s ease',
                    }}
                  />

                </div>

              </div>

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    'repeat(3, 1fr)',
                  gap:
                    '12px',
                  marginTop:
                    '20px',
                }}
              >

                <div
                  style={{
                    padding:
                      '13px',
                    background:
                      '#f8fafc',
                    borderRadius:
                      '8px',
                  }}
                >

                  <span
                    style={{
                      display:
                        'block',
                      fontSize:
                        '12px',
                      color:
                        '#64748b',
                    }}
                  >
                    To Do
                  </span>

                  <strong>
                    {todoTasks}
                  </strong>

                </div>

                <div
                  style={{
                    padding:
                      '13px',
                    background:
                      '#f8fafc',
                    borderRadius:
                      '8px',
                  }}
                >

                  <span
                    style={{
                      display:
                        'block',
                      fontSize:
                        '12px',
                      color:
                        '#64748b',
                    }}
                  >
                    In Progress
                  </span>

                  <strong>
                    {inProgressTasks}
                  </strong>

                </div>

                <div
                  style={{
                    padding:
                      '13px',
                    background:
                      '#f8fafc',
                    borderRadius:
                      '8px',
                  }}
                >

                  <span
                    style={{
                      display:
                        'block',
                      fontSize:
                        '12px',
                      color:
                        '#64748b',
                    }}
                  >
                    Completed
                  </span>

                  <strong>
                    {completedTasks}
                  </strong>

                </div>

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default Dashboard