import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useWorkspace } from '../context/useWorkspace'

function AuthPage() {
  const navigate = useNavigate()
  const { user, setUser, refreshWorkspace } = useWorkspace()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get('/auth/me')
      .then(async ({ data }) => {
        setUser(data.user)
        await refreshWorkspace()
        navigate('/')
      })
      .catch(() => setUser(null))
  }, [navigate, refreshWorkspace, setUser])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login'
      const { data } = await api.post(endpoint, { name, email, password })
      setUser(data.user)
      setPassword('')
      setMessage(mode === 'register' ? 'Account created.' : 'Signed in successfully.')
      await refreshWorkspace()
      navigate('/')
    } catch (error) {
      setMessage(error.response?.data?.error || 'Authentication request failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    setMessage('Signed out.')
  }

  if (user) {
    return (
      <main className="auth-page">
        <section className="auth-panel" aria-labelledby="auth-title">
          <h1 id="auth-title">You are signed in</h1>
          <p className="auth-subtitle">{user.name} · {user.email}</p>
          <div className="auth-footer">
            <Link className="auth-link" to="/clients">Continue to clients</Link>
            <button className="auth-link auth-logout" onClick={handleLogout}>Sign out</button>
          </div>
          {message && <p className="auth-message" role="status">{message}</p>}
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <h1 id="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-subtitle">Sign in to continue to checkout.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Name
              <input autoComplete="name" maxLength={100} onChange={(event) => setName(event.target.value)} value={name} />
            </label>
          )}
          <label>
            Email
            <input autoComplete="email" required type="email" onChange={(event) => setEmail(event.target.value)} value={email} />
          </label>
          <label>
            Password
            <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required type="password" onChange={(event) => setPassword(event.target.value)} value={password} />
          </label>
          <button className="auth-button" disabled={isLoading} type="submit">
            {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {message && <p className={`auth-message ${message.includes('failed') || message.includes('Could not') ? 'auth-error' : ''}`} role="status">{message}</p>}
        <div className="auth-footer">
          <span>{mode === 'login' ? 'New here?' : 'Already registered?'}</span>
          <button className="auth-link auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage('') }} type="button">
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </button>
          <Link className="auth-link" to="/clients">Back to workspace</Link>
        </div>
      </section>
    </main>
  )
}

export default AuthPage