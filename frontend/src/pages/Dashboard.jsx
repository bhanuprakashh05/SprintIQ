import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ListTodo,
  BrainCircuit,
  Settings,
  LogOut,
  CheckCircle2,
  Clock3,
  Circle,
  ListChecks,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

import '../App.css'

function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

const sprintId = searchParams.get('sprintId') || '2'
const sprintName =
  searchParams.get('sprintName') || 'Sprint 1'

  const [user, setUser] = useState({})

  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  })

  const [aiPrediction, setAiPrediction] = useState(null)

  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(true)

  const [error, setError] = useState('')
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem('user') || '{}'
    )

    setUser(storedUser)

    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setAiLoading(true)

        setError('')
        setAiError('')

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

        const [statsResponse, aiResponse] =
          await Promise.all([
            axios.get(
              `http://localhost:8080/api/dashboard/sprints/${sprintId}`,
              config
            ),
            axios.get(
              `http://localhost:8080/api/ai/sprint-risk/${sprintId}`,
              config
            ),
          ])

        setStats(statsResponse.data)
        setAiPrediction(aiResponse.data)

      } catch (error) {
        console.error(
          'Dashboard API error:',
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

          // If dashboard statistics failed
          if (
            error.config?.url?.includes(
              '/api/dashboard/'
            )
          ) {
            setError(
              'Unable to load dashboard statistics'
            )
          }

          // If AI service failed
          if (
            error.config?.url?.includes(
              '/api/ai/'
            )
          ) {
            setAiError(
              'AI analysis is currently unavailable'
            )
          }

          // Fallback if Promise.all failed
          if (!error.config?.url) {
            setError(
              'Unable to load dashboard data'
            )
          }
        }

      } finally {
        setLoading(false)
        setAiLoading(false)
      }
    }

    fetchDashboardData()

  }, [navigate, sprintId])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  const getRiskClass = (risk) => {
    if (risk === 'LOW') {
      return 'risk-low'
    }

    if (risk === 'MEDIUM') {
      return 'risk-medium'
    }

    return 'risk-high'
  }

  const getRiskIcon = (risk) => {
    if (risk === 'LOW') {
      return <ShieldCheck size={26} />
    }

    if (risk === 'MEDIUM') {
      return <AlertTriangle size={26} />
    }

    return <AlertCircle size={26} />
  }

  const getRiskMessage = (risk) => {
    if (risk === 'LOW') {
      return 'Sprint is currently on track.'
    }

    if (risk === 'MEDIUM') {
      return 'Sprint needs attention.'
    }

    return 'Sprint is at high risk.'
  }

  const confidencePercentage =
    aiPrediction
      ? Math.round(
          aiPrediction.confidence * 100
        )
      : 0

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
            className="nav-item active"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>

          <a
            href="/projects"
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
            className="nav-item"
          >
            <ListTodo size={20} />
            <span>Tasks</span>
          </a>

          <a
            href="/ai-insights"
            className="nav-item"
          >
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

      {/* MAIN CONTENT */}

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

        {/* DASHBOARD CONTENT */}

        <section className="dashboard-content">

          {/* WELCOME CARD */}

          <div className="welcome-card">

            <div>

              <span className="eyebrow">
                SPRINTIQ OVERVIEW
              </span>

              <h2>
                Manage your sprint with intelligence.
              </h2>

              <p>
                Track projects, manage tasks and identify
                sprint risks before they become problems.
              </p>

            </div>

            <BrainCircuit
              size={70}
              className="welcome-icon"
            />

          </div>

          {/* STATISTICS */}

          <div className="stats-section">

            <div className="section-heading">

              <div>

                <h2>
                  Sprint Statistics
                </h2>

                <p>
                  Current task progress for {sprintName}
                </p>

              </div>

            </div>

            {loading ? (

              <div className="dashboard-loading">
                Loading sprint statistics...
              </div>

            ) : error ? (

              <div className="dashboard-error">
                {error}
              </div>

            ) : (

              <div className="stats-grid">

                <div className="stat-card">

                  <div className="stat-icon total">
                    <ListChecks size={24} />
                  </div>

                  <div>
                    <span>Total Tasks</span>

                    <strong>
                      {stats.totalTasks ?? 0}
                    </strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon todo">
                    <Circle size={24} />
                  </div>

                  <div>
                    <span>To Do</span>

                    <strong>
                      {stats.todoTasks ?? 0}
                    </strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon progress">
                    <Clock3 size={24} />
                  </div>

                  <div>
                    <span>In Progress</span>

                    <strong>
                      {stats.inProgressTasks ?? 0}
                    </strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon completed">
                    <CheckCircle2 size={24} />
                  </div>

                  <div>
                    <span>Completed</span>

                    <strong>
                      {stats.completedTasks ?? 0}
                    </strong>
                  </div>

                </div>

              </div>

            )}

          </div>

          {/* AI RISK */}

          <div className="dashboard-ai-section">

            <div className="section-heading">

              <div>
                <h2>
                  AI Sprint Risk
                </h2>

                <p>
                  Intelligent analysis for {sprintName}
                </p>
              </div>

              <button
                type="button"
                className="ai-view-button"
                onClick={() =>
                  navigate(
                    `/ai-insights?sprintId=${sprintId}`
                  )
                }
              >
                View AI Insights
                <ArrowRight size={16} />
              </button>

            </div>

            {aiLoading ? (

              <div className="ai-dashboard-loading">

                <RefreshCw
                  size={20}
                  className="ai-loading-icon"
                />

                <span>
                  Generating AI analysis...
                </span>

              </div>

            ) : aiError ? (

              <div className="dashboard-error">
                {aiError}
              </div>

            ) : aiPrediction ? (

              <div
                className={`dashboard-ai-card ${getRiskClass(
                  aiPrediction.risk
                )}`}
              >

                <div className="dashboard-ai-risk">

                  <div className="dashboard-ai-icon">
                    {getRiskIcon(
                      aiPrediction.risk
                    )}
                  </div>

                  <div>

                    <span>
                      AI PREDICTED RISK
                    </span>

                    <h3>
                      {aiPrediction.risk}
                    </h3>

                    <p>
                      {getRiskMessage(
                        aiPrediction.risk
                      )}
                    </p>

                  </div>

                </div>

                <div className="dashboard-ai-metrics">

                  <div>
                    <span>
                      Confidence
                    </span>

                    <strong>
                      {confidencePercentage}%
                    </strong>
                  </div>

                  <div>
                    <span>
                      Completion
                    </span>

                    <strong>
                      {aiPrediction.completionRate}%
                    </strong>
                  </div>

                  <div>
                    <span>
                      Days Left
                    </span>

                    <strong>
                      {aiPrediction.daysRemaining}
                    </strong>
                  </div>

                </div>

              </div>

            ) : null}

          </div>

        </section>

      </main>

    </div>
  )
}

export default Dashboard