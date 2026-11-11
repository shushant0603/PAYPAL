import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import { api } from '../api/client'
import '../App.css'

export function PayPalButton({ amount = 800, invoiceId, publicToken, className = '' }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const { data } = publicToken
        ? await api.post(`/public/invoices/${publicToken}/create-order`)
        : invoiceId
          ? await api.post('/payments/create-order', { invoiceId })
          : await api.post('/payment', { amount })
      if (!data.approvalUrl) throw new Error('PayPal did not return an approval URL.')
      window.location.assign(data.approvalUrl)
    } catch (error) {
      setMessage(error.response?.data?.error || error.message || 'Could not start the payment.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-brand px-3.5 text-xs font-bold text-white transition hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60 ${className}`} onClick={handleSubmit} disabled={isLoading}>
        <CreditCard size={14} />{isLoading ? 'Connecting…' : 'Pay with PayPal'}
      </button>
      {message && <p className="payment-error" role="alert">{message}</p>}
    </div>
  )
}

function Payment() {
  const paymentStatus = new URLSearchParams(window.location.search).get('payment')
  return (
    <main className="payment-page">
      <h1>PayPal checkout</h1>
      <p>Complete a $1.00 sandbox payment.</p>
      <PayPalButton />
      {paymentStatus && <p className="payment-message" role="status">Payment {paymentStatus}.</p>}
      <Link to="/">Back to workspace</Link>
      <Link to="/login">Sign in or create an account</Link>
    </main>
  )
}

export default Payment
