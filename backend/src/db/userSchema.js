import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, select: false },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '', maxlength: 40 },
  country: { type: String, default: '', maxlength: 100 },
  currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
  authProvider: { type: String, enum: ['password', 'google'], default: 'password' },
  isEmailVerified: { type: Boolean, default: false },
  googleSub: { type: String, unique: true, sparse: true },
}, { timestamps: true })

const workspaceSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  businessName: { type: String, default: '', trim: true, maxlength: 120 },
  businessEmail: { type: String, default: '', lowercase: true, trim: true, maxlength: 254 },
  businessAddress: { type: String, default: '', maxlength: 500 },
  businessLogo: { type: String, default: '' },
  defaultCurrency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
  timezone: { type: String, default: 'UTC' },
}, { timestamps: true })

const clientSchema = new Schema({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  companyName: { type: String, default: '', trim: true, maxlength: 120 },
  phone: { type: String, default: '', maxlength: 40 },
  country: { type: String, default: '', maxlength: 100 },
  address: { type: String, default: '', maxlength: 500 },
  notes: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true })
clientSchema.index({ workspaceId: 1, email: 1 })

const projectSchema = new Schema({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, default: '', maxlength: 4000 },
  budget: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
  status: { type: String, enum: ['Planned', 'In progress', 'On hold', 'Completed'], default: 'Planned' },
  startDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
}, { timestamps: true })

const invoiceItemSchema = new Schema({
  description: { type: String, required: true, trim: true, maxlength: 300 },
  quantity: { type: Number, required: true, min: 0.01 },
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
}, { _id: false })

const invoiceSchema = new Schema({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
  invoiceNumber: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, default: '', maxlength: 4000 },
  items: { type: [invoiceItemSchema], validate: [(items) => items.length > 0, 'At least one invoice item is required.'] },
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Draft', 'Pending', 'Paid', 'Overdue'], default: 'Draft', index: true },
  publicToken: { type: String, required: true, unique: true, index: true },
}, { timestamps: true })
invoiceSchema.index({ workspaceId: 1, invoiceNumber: 1 }, { unique: true })

const paymentSchema = new Schema({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
  provider: { type: String, enum: ['paypal'], default: 'paypal' },
  paypalOrderId: { type: String, unique: true, sparse: true },
  paypalCaptureId: { type: String, unique: true, sparse: true },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
  status: { type: String, enum: ['CREATED', 'CAPTURING', 'COMPLETED', 'FAILED'], default: 'CREATED', index: true },
  paymentMethod: { type: String, default: 'PayPal' },
  paidAt: { type: Date, default: null },
}, { timestamps: true })

const webhookEventSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  paypalOrderId: { type: String, default: '' },
  paypalCaptureId: { type: String, default: '' },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
  processed: { type: Boolean, default: false, index: true },
  receivedAt: { type: Date, default: Date.now },
  processedAt: { type: Date, default: null },
}, { timestamps: true })

const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema)

export const User = model('User', userSchema)
export const Workspace = model('Workspace', workspaceSchema)
export const Client = model('Client', clientSchema)
export const Project = model('Project', projectSchema)
export const Invoice = model('Invoice', invoiceSchema)
export const Payment = model('Payment', paymentSchema)
export const WebhookEvent = model('WebhookEvent', webhookEventSchema)
