import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import express from 'express'
import jwt from 'jsonwebtoken'
import {
  createPasswordUser,
  findUserByEmail,
  findUserById,
  getWorkspaceForUser,
  isDatabaseConnected,
} from '../utilis/db.js'

const router = express.Router()
const jwtSecret = process.env.JWT_SECRET
const backendUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '')
const useSecureCookies = process.env.NODE_ENV === 'production' || backendUrl.startsWith('https://')
const cookieName = 'auth_token'
const cookieOptions = {
  httpOnly: true,
  secure: useSecureCookies,
  sameSite: useSecureCookies ? 'none' : 'lax',
  path: '/',
}
router.use(cookieParser())

const safeUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  phone: user.phone,
  country: user.country,
  currency: user.currency,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
})

const setSession = (res, user) => {
  const token = jwt.sign({ sub: String(user.id) }, jwtSecret, { expiresIn: '7d' })
  res.cookie(cookieName, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

const requireJwtSecret = (res) => {
  if (jwtSecret) return true
  res.status(503).json({ error: 'Authentication is not configured. Set JWT_SECRET in backend/.env.' })
  return false
}

export const requireAuth = async (req, res, next) => {
  if (!jwtSecret) {
    return res.status(503).json({ error: 'Authentication is not configured.' })
  }

  try {
    const token = req.cookies?.[cookieName]
    if (!token) return res.status(401).json({ error: 'Please sign in.' })

    const payload = jwt.verify(token, jwtSecret)
    const user = await findUserById(payload.sub)
    if (!user) return res.status(401).json({ error: 'Please sign in.' })

    req.user = user
    next()
  } catch {
    res.clearCookie(cookieName, cookieOptions)
    res.status(401).json({ error: 'Please sign in again.' })
  }
}

router.use((req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({ error: 'MongoDB is unavailable. Check MONGODB_URI and database connectivity.' })
  }
  next()
})

router.post('/register', async (req, res) => {
  if (!requireJwtSecret(res)) return

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'Password must be 8–72 bytes long.' })
  }
  if (name.length > 100) return res.status(400).json({ error: 'Name must be 100 characters or fewer.' })

  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await createPasswordUser({ email, name: name || email.split('@')[0], passwordHash })
    await getWorkspaceForUser(user)
    setSession(res, user)
    res.status(201).json({ user: safeUser(user) })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }
    console.error('Registration failed:', error.message)
    res.status(500).json({ error: 'Could not create the account.' })
  }
})

router.post('/login', async (req, res) => {
  if (!requireJwtSecret(res)) return

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const user = await findUserByEmail(email, true)
  const passwordMatches = user?.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : false

  if (!passwordMatches) return res.status(401).json({ error: 'Email or password is incorrect.' })

  setSession(res, user)
  res.json({ user: safeUser(user) })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: safeUser(req.user) })
})

router.post('/logout', (req, res) => {
  res.clearCookie(cookieName, cookieOptions)
  res.status(204).end()
})

export default router