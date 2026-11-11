import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, apiBaseUrl } from '../api/client'
import { useWorkspace } from '../context/useWorkspace'

function AuthPage() {
  const navigate = useNavigate()
  const { user, setUser, refreshWorkspace } = useWorkspace()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('auth') === 'success'
      ? 'Google sign-in successful.'
      : params.has('authError')
        ? 'Google sign-in failed. Check OAuth setup and try again.'
        : ''
    if (params.has('auth') || params.has('authError')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    return status
  })

  useEffect(() => {
    api.get('/auth/config')
      .then(({ data }) => setGoogleEnabled(data.googleEnabled))
      .catch(() => setMessage('Could not connect to the authentication server.'))

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

  const googleLogo = (
    <svg aria-hidden="true" className="google-logo" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M47.6 24.5c0-1.6-.1-3.1-.4-4.5H24v9h13.2c-.6 3-2.4 5.5-5 7.2v6h8c4.7-4.3 7.4-10.5 7.4-17.7Z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8-6c-2.2 1.5-4.9 2.4-8 2.4-6.2 0-11.5-4.2-13.4-9.9H2.3v6.2C6.2 42.6 14.5 48 24 48Z" />
      <path fill="#FBBC05" d="M10.6 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7v-6.2H2.3C.8 16.1 0 20 0 24s.8 7.9 2.3 11l8.3-6.3Z" />
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.9 2.4 30.5 0 24 0 14.5 0 6.2 5.4 2.3 13.1l8.3 6.2C12.5 13.7 17.8 9.5 24 9.5Z" />
    </svg>
  )

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

        <div className="auth-divider">or</div>
        {googleEnabled ? (
          <a className="google-button" href={`${apiBaseUrl.replace(/\/$/, '')}/auth/google`}>{googleLogo}{mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}</a>
        ) : (
          <button aria-disabled="true" className="google-button" disabled type="button">
            {googleLogo}Google sign-in needs server credentials
          </button>
        )}

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