import express from 'express'
import paypal from 'paypal-rest-sdk'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') })

const app = express()
const port = Number(process.env.PORT || 3000)
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
const backendUrl = (process.env.BACKEND_URL || `http://localhost:${port}`).replace(/\/$/, '')
const paypalClientId = process.env.PAYPAL_CLIENT_ID || process.env.YOUR_CLIENT_ID
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.YOUR_CLIENT_SECRET
const paypalConfigured = Boolean(paypalClientId && paypalClientSecret)

app.use(cors({ origin: frontendUrl, credentials: true }))
app.use(express.json())
app.use(cookieParser())

const [
    { default: authRouter },
    { connectDatabase, isDatabaseConnected },
    { privateApiRouter, publicApiRouter, paypalWebhookHandler },
] = await Promise.all([
    import('./src/routes/auth.routes.js'),
    import('./src/utilis/db.js'),
    import('./src/routes/api.routes.js'),
])
app.use('/api/auth', authRouter)
app.post('/api/webhooks/paypal', paypalWebhookHandler)
app.use('/api/public', publicApiRouter)
app.use('/api', privateApiRouter)

if (paypalConfigured) {
    paypal.configure({
        mode: process.env.PAYPAL_MODE || 'sandbox',
        client_id: paypalClientId,
        client_secret: paypalClientSecret,
    })
} else {
    console.warn('PayPal credentials are missing. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env.')
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mongoConnected: isDatabaseConnected(), paypalConfigured })
})

app.post('/api/payment', (req, res) => {
    if (!paypalConfigured) {
        return res.status(503).json({ error: 'PayPal credentials are not configured on the backend.' })
    }

    const requestedAmount = Number(req.body?.amount ?? 800)
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0 || requestedAmount > 100000) {
        return res.status(400).json({ error: 'Payment amount must be between $0.01 and $100,000.' })
    }

    const payment = {
        intent: 'sale',
        payer: { payment_method: 'paypal' },
        redirect_urls: {
            return_url: `${backendUrl}/api/payment/success`,
            cancel_url: `${backendUrl}/api/payment/cancel`,
        },
        transactions: [{
            amount: { total: requestedAmount.toFixed(2), currency: 'USD' },
            description: typeof req.body?.invoiceId === 'string'
                ? `Invoice ${req.body.invoiceId}`
                : 'Sandbox payment',
        }],
    }

    try {
        paypal.payment.create(payment, (error, createdPayment) => {
            if (error) {
                console.error('PayPal payment creation failed:', error.message)
                return res.status(502).json({ error: 'PayPal could not create the payment. Check backend logs.' })
            }

            const approvalUrl = createdPayment.links?.find((link) => link.rel === 'approval_url')?.href
            if (!approvalUrl) {
                return res.status(502).json({ error: 'PayPal did not return an approval URL.' })
            }

            res.json({ approvalUrl })
        })
    } catch (error) {
        console.error('PayPal request failed:', error.message)
        res.status(502).json({ error: 'Could not contact PayPal. Check backend logs.' })
    }
})

app.get('/api/payment/success', (req, res) => {
    const { paymentId, PayerID } = req.query
    if (!paypalConfigured || !paymentId || !PayerID) {
        return res.redirect(`${frontendUrl}/?payment=error`)
    }

    paypal.payment.execute(paymentId, { payer_id: PayerID }, (error, completedPayment) => {
        if (error || completedPayment?.state !== 'approved') {
            if (error) console.error('PayPal payment execution failed:', error.message)
            return res.redirect(`${frontendUrl}/?payment=error`)
        }

        res.redirect(`${frontendUrl}/?payment=success`)
    })
})

app.get('/api/payment/cancel', (req, res) => {
    res.redirect(`${frontendUrl}/?payment=cancelled`)
})

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})

const connectWithRetry = async () => {
    try {
        await connectDatabase()
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`)
        const retryTimer = setTimeout(connectWithRetry, 5000)
        retryTimer.unref()
    }
}

connectWithRetry()