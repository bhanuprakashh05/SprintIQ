import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BrainCircuit,
  User,
  Mail,
  Lock,
  UserPlus,
} from 'lucide-react'
import axios from 'axios'

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError(
        'Password must contain at least 6 characters'
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match'
      )
      return
    }

    try {
      setLoading(true)

      await axios.post(
        'http://localhost:8080/api/auth/register',
        {
          name,
          email,
          password,
        }
      )

      setSuccess(
        'Admin account created successfully. Redirecting to login...'
      )

      setTimeout(() => {
        navigate('/login')
      }, 1200)

    } catch (error) {
      console.error(error)

      setError(
        error.response?.data?.message ||
        'Unable to create account'
      )
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

          <p>
            Agile Intelligence
          </p>

        </div>

        <div className="login-heading">

          <h2>
            Create Account
          </h2>

          <p>
            Create your SprintIQ Admin account
          </p>

        </div>

        <form onSubmit={handleRegister}>

          <div className="form-group">

            <label>
              Name
            </label>

            <div className="input-wrapper">

              <User size={18} />

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />

            </div>

          </div>

          <div className="form-group">

            <label>
              Email
            </label>

            <div className="input-wrapper">

              <Mail size={18} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

          </div>

          <div className="form-group">

            <label>
              Password
            </label>

            <div className="input-wrapper">

              <Lock size={18} />

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

            </div>

          </div>

          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <div className="input-wrapper">

              <Lock size={18} />

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
              />

            </div>

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                color: '#16a34a',
                fontSize: '13px',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            <UserPlus size={18} />

            {loading
              ? 'Creating Account...'
              : 'Create Admin Account'}

          </button>

        </form>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
          }}
        >

          <span
            style={{
              color: '#64748b',
            }}
          >
            Already have an account?{' '}
          </span>

          <Link
            to="/login"
            style={{
              color: '#4f46e5',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>

        </div>

      </div>

    </div>
  )
}

export default Register