import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import axios from 'axios'

import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ListTodo,
  BrainCircuit,
  Settings,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Clock3,
  CheckCircle2,
  Target,
  RefreshCw,
} from 'lucide-react'

import '../App.css'

function AIInsights() {
  const navigate = useNavigate()

  const [user, setUser] = useState({})
  const [sprints, setSprints] = useState([])
  const [selectedSprint, setSelectedSprint] = useState('2')

  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (selectedSprint) {
      fetchPrediction(selectedSprint)
    }
  }, [selectedSprint])

  const fetchSprints = async () => {
    try {
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

      if (response.data.length > 0) {
        setSelectedSprint(
          String(response.data[0].id)
        )
      }

    } catch (error) {
      console.error('Sprint API error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        setError('Unable to load sprints')
        setLoading(false)
      }
    }
  }

  const fetchPrediction = async (sprintId) => {
    try {
      setLoading(true)
      setError('')
      setPrediction(null)

      const token = localStorage.getItem('token')

      const response = await axios.get(
        `http://localhost:8080/api/ai/sprint-risk/${sprintId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setPrediction(response.data)

    } catch (error) {
      console.error('AI prediction error:', error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else if (error.response?.status === 503) {
        setError(
          'AI service is currently unavailable. Make sure the AI service is running.'
        )
      } else {
        setError('Unable to generate AI prediction')
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
      return <ShieldCheck size={32} />
    }

    if (risk === 'MEDIUM') {
      return <AlertTriangle size={32} />
    }

    return <AlertCircle size={32} />
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
    prediction
      ? Math.round(prediction.confidence * 100)
      : 0

  const selectedSprintData = sprints.find(
    (sprint) =>
      String(sprint.id) === String(selectedSprint)
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
            className="nav-item active"
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

      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>AI Insights</h1>
            <p>
              Intelligent sprint risk analysis
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

        <section className="ai-content">

          {/* HEADER */}

          <div className="ai-page-header">

            <div>
              <span className="eyebrow">
                ARTIFICIAL INTELLIGENCE
              </span>

              <h2>
                Sprint Risk Analysis
              </h2>

              <p>
                Use AI to understand sprint health
                and identify potential delivery risks.
              </p>
            </div>

            <div className="ai-sprint-selector">

              <label htmlFor="ai-sprint">
                Analyze Sprint
              </label>

              <select
                id="ai-sprint"
                value={selectedSprint}
                onChange={(event) =>
                  setSelectedSprint(
                    event.target.value
                  )
                }
              >
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

          </div>

          {/* LOADING */}

          {loading && (

            <div className="ai-loading">

              <RefreshCw
                size={24}
                className="ai-loading-icon"
              />

              <span>
                Generating AI analysis...
              </span>

            </div>

          )}

          {/* ERROR */}

          {!loading && error && (

            <div className="dashboard-error">
              {error}
            </div>

          )}

          {/* RESULTS */}

          {!loading &&
            !error &&
            prediction && (

            <>

              {/* RISK CARD */}

              <div
                className={`ai-risk-card ${getRiskClass(
                  prediction.risk
                )}`}
              >

                <div className="ai-risk-icon">
                  {getRiskIcon(
                    prediction.risk
                  )}
                </div>

                <div className="ai-risk-content">

                  <span>
                    AI PREDICTED RISK
                  </span>

                  <h2>
                    {prediction.risk}
                  </h2>

                  <p>
                    {getRiskMessage(
                      prediction.risk
                    )}
                  </p>

                </div>

                <div className="ai-confidence">

                  <span>
                    Confidence
                  </span>

                  <strong>
                    {confidencePercentage}%
                  </strong>

                </div>

              </div>


              {/* METRICS */}

              <div className="ai-metrics-grid">

                <div className="ai-metric-card">

                  <div className="ai-metric-icon completion">
                    <Target size={23} />
                  </div>

                  <div>
                    <span>
                      Completion Rate
                    </span>

                    <strong>
                      {prediction.completionRate}%
                    </strong>
                  </div>

                </div>


                <div className="ai-metric-card">

                  <div className="ai-metric-icon days">
                    <Clock3 size={23} />
                  </div>

                  <div>
                    <span>
                      Days Remaining
                    </span>

                    <strong>
                      {prediction.daysRemaining}
                    </strong>
                  </div>

                </div>


                <div className="ai-metric-card">

                  <div className="ai-metric-icon sprint">
                    <CalendarDays size={23} />
                  </div>

                  <div>
                    <span>
                      Sprint
                    </span>

                    <strong>
                      {selectedSprintData?.name ||
                        `#${selectedSprint}`}
                    </strong>
                  </div>

                </div>


                <div className="ai-metric-card">

                  <div className="ai-metric-icon status">
                    <CheckCircle2 size={23} />
                  </div>

                  <div>
                    <span>
                      Analysis Status
                    </span>

                    <strong>
                      Complete
                    </strong>
                  </div>

                </div>

              </div>


              {/* INTERPRETATION */}

              <div className="ai-analysis-card">

                <div className="ai-analysis-header">

                  <BrainCircuit size={22} />

                  <div>
                    <h3>
                      AI Analysis
                    </h3>

                    <p>
                      What this prediction means
                    </p>
                  </div>

                </div>

                <div className="ai-analysis-body">

                  {prediction.risk === 'LOW' && (
                    <p>
                      The current sprint has a low
                      predicted risk level. Continue
                      tracking task progress and
                      maintain the current development
                      pace.
                    </p>
                  )}

                  {prediction.risk === 'MEDIUM' && (
                    <p>
                      The sprint has a moderate level
                      of risk. Review remaining tasks,
                      prioritize important work and
                      monitor progress closely.
                    </p>
                  )}

                  {prediction.risk === 'HIGH' && (
                    <p>
                      The sprint has a high predicted
                      risk. Consider reviewing the
                      remaining workload, prioritizing
                      critical tasks and taking action
                      to improve completion before the
                      sprint deadline.
                    </p>
                  )}

                </div>

              </div>

            </>
          )}

        </section>

      </main>

    </div>
  )
}

export default AIInsights