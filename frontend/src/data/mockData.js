export const initialInvoices = [
  { id: 'INV-2048', client: 'Northstar Studio', project: 'Brand identity system', amount: 4800, currency: 'USD', issueDate: '2025-03-14', dueDate: '2025-04-13', status: 'Pending', email: 'ap@northstar.studio', items: [{ description: 'Brand identity system', quantity: 1, rate: 4800 }] },
  { id: 'INV-2047', client: 'Morrow & Co.', project: 'Product design sprint', amount: 3250, currency: 'USD', issueDate: '2025-03-09', dueDate: '2025-03-23', status: 'Paid', email: 'finance@morrow.co', items: [{ description: 'Product design sprint', quantity: 1, rate: 3250 }] },
  { id: 'INV-2046', client: 'Orbit Health', project: 'Landing page redesign', amount: 2100, currency: 'USD', issueDate: '2025-03-04', dueDate: '2025-03-18', status: 'Overdue', email: 'hello@orbithealth.io', items: [{ description: 'Landing page redesign', quantity: 1, rate: 2100 }] },
  { id: 'INV-2045', client: 'Northstar Studio', project: 'Design system audit', amount: 1650, currency: 'USD', issueDate: '2025-02-26', dueDate: '2025-03-28', status: 'Pending', email: 'ap@northstar.studio', items: [{ description: 'Design system audit', quantity: 1, rate: 1650 }] },
  { id: 'INV-2044', client: 'Form & Function', project: 'Webflow development', amount: 5400, currency: 'USD', issueDate: '2025-02-19', dueDate: '2025-03-05', status: 'Paid', email: 'team@formandfunction.design', items: [{ description: 'Webflow development', quantity: 1, rate: 5400 }] },
  { id: 'INV-2043', client: 'Morrow & Co.', project: 'Research synthesis', amount: 900, currency: 'USD', issueDate: '2025-02-12', dueDate: '2025-03-14', status: 'Draft', email: 'finance@morrow.co', items: [{ description: 'Research synthesis', quantity: 1, rate: 900 }] },
]

export const transactions = [
  { id: 'TX-9824', client: 'Morrow & Co.', detail: 'INV-2047 · Product design sprint', date: 'Mar 18, 2025', amount: 3250, method: 'PayPal', initials: 'M', tone: 'bg-emerald-50 text-emerald-700' },
  { id: 'TX-9818', client: 'Form & Function', detail: 'INV-2044 · Webflow development', date: 'Mar 16, 2025', amount: 5400, method: 'Bank transfer', initials: 'F', tone: 'bg-violet-50 text-violet-700' },
  { id: 'TX-9792', client: 'Northstar Studio', detail: 'INV-2042 · March retainer', date: 'Mar 12, 2025', amount: 2800, method: 'PayPal', initials: 'N', tone: 'bg-amber-50 text-amber-700' },
  { id: 'TX-9760', client: 'Fable Commerce', detail: 'INV-2039 · Shopify build', date: 'Mar 08, 2025', amount: 1900, method: 'Wise', initials: 'F', tone: 'bg-sky-50 text-sky-700' },
]

export const revenueByRange = {
  '7D': [
    { label: 'Mon', income: 940, expenses: 280 }, { label: 'Tue', income: 1280, expenses: 420 }, { label: 'Wed', income: 760, expenses: 210 }, { label: 'Thu', income: 1640, expenses: 540 }, { label: 'Fri', income: 1210, expenses: 350 }, { label: 'Sat', income: 1870, expenses: 670 }, { label: 'Sun', income: 1450, expenses: 390 },
  ],
  '30D': [
    { label: 'Feb 24', income: 2200, expenses: 800 }, { label: 'Mar 3', income: 3100, expenses: 950 }, { label: 'Mar 10', income: 2700, expenses: 780 }, { label: 'Mar 17', income: 4200, expenses: 1200 }, { label: 'Mar 24', income: 3500, expenses: 990 }, { label: 'Mar 31', income: 4900, expenses: 1350 },
  ],
  '90D': [
    { label: 'Jan 6', income: 14200, expenses: 4100 }, { label: 'Jan 20', income: 16800, expenses: 4700 }, { label: 'Feb 3', income: 15100, expenses: 3900 }, { label: 'Feb 17', income: 19400, expenses: 5200 }, { label: 'Mar 3', income: 17700, expenses: 4600 }, { label: 'Mar 17', income: 22300, expenses: 6100 },
  ],
  '1Y': [
    { label: 'Apr', income: 18400, expenses: 4900 }, { label: 'Jun', income: 21100, expenses: 5600 }, { label: 'Aug', income: 19700, expenses: 5200 }, { label: 'Oct', income: 25400, expenses: 6400 }, { label: 'Dec', income: 23100, expenses: 5900 }, { label: 'Feb', income: 28600, expenses: 7100 },
  ],
}

export const clients = [
  { name: 'Northstar Studio', contact: 'Amelia Parker', email: 'ap@northstar.studio', projects: 3, total: 12800, initials: 'N', tone: 'bg-amber-50 text-amber-700' },
  { name: 'Morrow & Co.', contact: 'Jordan Lee', email: 'finance@morrow.co', projects: 2, total: 8750, initials: 'M', tone: 'bg-violet-50 text-violet-700' },
  { name: 'Orbit Health', contact: 'Priya Shah', email: 'hello@orbithealth.io', projects: 1, total: 4600, initials: 'O', tone: 'bg-sky-50 text-sky-700' },
  { name: 'Form & Function', contact: 'Theo Martin', email: 'team@formandfunction.design', projects: 2, total: 15400, initials: 'F', tone: 'bg-emerald-50 text-emerald-700' },
  { name: 'Fable Commerce', contact: 'Cameron Bell', email: 'cameron@fablecommerce.com', projects: 1, total: 3900, initials: 'F', tone: 'bg-rose-50 text-rose-700' },
]

export const projects = [
  { name: 'Brand identity system', client: 'Northstar Studio', status: 'In progress', progress: 72, due: 'Apr 08, 2025', value: 6800, color: 'bg-brand' },
  { name: 'Product design sprint', client: 'Morrow & Co.', status: 'In progress', progress: 54, due: 'Apr 12, 2025', value: 5200, color: 'bg-violet-500' },
  { name: 'Landing page redesign', client: 'Orbit Health', status: 'At risk', progress: 86, due: 'Mar 28, 2025', value: 4600, color: 'bg-amber-500' },
  { name: 'Webflow development', client: 'Form & Function', status: 'Completed', progress: 100, due: 'Mar 17, 2025', value: 5400, color: 'bg-emerald-500' },
]

export const deadlines = [
  { day: '24', month: 'MAR', client: 'Northstar Studio', invoice: 'INV-2048', amount: 4800, status: 'Due in 5 days' },
  { day: '28', month: 'MAR', client: 'Orbit Health', invoice: 'INV-2045', amount: 1650, status: 'Due in 9 days' },
  { day: '02', month: 'APR', client: 'Fable Commerce', invoice: 'INV-2051', amount: 2400, status: 'Due in 14 days' },
]
