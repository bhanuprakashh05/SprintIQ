import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, Mail, Lock, LogIn } from 'lucide-react'
import axios from 'axios'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        {
          email,
          password,
        }
      )

      const user = response.data

      localStorage.setItem('token', user.token)
      localStorage.setItem('user', JSON.stringify(user))

      navigate('/dashboard')
    } catch (error) {
      console.error(error)

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setError('Invalid email or password')
      } else {
        setError('Unable to connect to the server')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-brand">
          <div className="login-icon">
            <BrainCircuit size={30} />
          </div>

          <h1>SprintIQ</h1>
          <p>Agile Intelligence</p>
        </div>

        <div className="login-heading">
          <h2>Welcome back</h2>
          <p>Sign in to continue to SprintIQ</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            <LogIn size={18} />

            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

      </div>

    </div>
  )
}

export default Login