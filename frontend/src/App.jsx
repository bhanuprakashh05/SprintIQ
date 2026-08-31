import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Sprints from './pages/Sprints'
import Tasks from './pages/Tasks'
import AIInsights from './pages/AIInsights'
import Settings from './pages/Settings'

import './App.css'


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {

  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}


// =====================================================
// APP
// =====================================================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={
            localStorage.getItem('token')
              ? (
                <Navigate
                  to="/dashboard"
                  replace
                />
              )
              : (
                <Navigate
                  to="/login"
                  replace
                />
              )
          }
        />


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PROJECTS
        ================================================= */}

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            SPRINTS
        ================================================= */}

        <Route
          path="/sprints"
          element={
            <ProtectedRoute>
              <Sprints />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            TASKS
        ================================================= */}

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            AI INSIGHTS
        ================================================= */}

        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <AIInsights />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  )
}


export default App