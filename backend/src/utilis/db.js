import mongoose from 'mongoose'
import { User, Workspace } from '../db/userSchema.js'

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is missing from backend/.env.')
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  console.log('Connected to MongoDB.')
}

export const isDatabaseConnected = () => mongoose.connection.readyState === 1

export const findUserByEmail = (email, includePasswordHash = false) => {
  const query = User.findOne({ email })
  return includePasswordHash ? query.select('+passwordHash') : query
}

export const findUserById = (id) => User.findById(id)

export const createPasswordUser = ({ email, name, passwordHash }) =>
  User.create({ email, name, passwordHash })

export const getWorkspaceForUser = (user) => Workspace.findOneAndUpdate(
  { ownerId: user._id },
  { $setOnInsert: {
    ownerId: user._id,
    name: `${user.name}'s Workspace`,
    businessName: user.name,
    businessEmail: user.email,
    defaultCurrency: user.currency || 'USD',
  } },
  { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
)