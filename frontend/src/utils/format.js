export const money = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(amount)
