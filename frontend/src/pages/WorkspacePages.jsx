import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, BadgeDollarSign, Banknote,
  BriefcaseBusiness, CalendarDays, Check, ChevronDown, Clock3, Copy,
  CreditCard, FilePlus2, FileText, Filter, Globe2, Plus, Search, Send,
  Sparkles, TrendingUp, Users, Wallet, WandSparkles,
} from 'lucide-react'
import { api, normalizeRecord } from '../api/client'
import { useWorkspace } from '../context/useWorkspace'
import { Avatar, MetricCard, PageHeading, Panel, StatusBadge, WorkspaceDataState } from '../components/WorkspaceUI'
import { PayPalButton } from '../components/Payment'
import { money } from '../utils/format'
import { primaryButton, secondaryButton } from '../utils/styles'

const RevenueChart = lazy(() => import('../components/RevenueChart'))
const ChartFallback = () => <div className="h-72 animate-pulse rounded-xl border border-line bg-white" aria-label="Loading chart" />
const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const errorMessage = (error) => error.response?.data?.error || 'Request failed. Please try again.'

function RevenuePanel({ range, setRange, data, currency }) {
  return <Suspense fallback={<ChartFallback />}><RevenueChart data={data || []} range={range} onRangeChange={setRange} currency={currency} /></Suspense>
}

function QuickAction({ icon: Icon, label, to, tone = 'indigo' }) {
  const tones = { indigo: 'bg-indigo-50 text-brand group-hover:bg-brand group-hover:text-white', emerald: 'bg-emerald-50 text-success group-hover:bg-success group-hover:text-white', violet: 'bg-violet-50 text-ai group-hover:bg-ai group-hover:text-white' }
  return <Link to={to} className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3.5 transition duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"><span className={`grid size-9 place-items-center rounded-lg transition ${tones[tone]}`}><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-ink">{label}</span><span className="mt-0.5 block text-[10px] text-muted">Open workspace</span></span><ArrowRight size={14} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand" /></Link>
}

export function DashboardPage() {
  const { dashboard, dashboardError, isDashboardLoading, isLoading, error, refreshWorkspace, refreshDashboard, workspace } = useWorkspace()
  const [range, setRange] = useState('30D')
  const [rangeData, setRangeData] = useState([])
  const [rangeError, setRangeError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/dashboard', { params: { range } })
      .then(({ data }) => { if (active) { setRangeData(data.revenue || []); setRangeError('') } })
      .catch((requestError) => { if (active) setRangeError(errorMessage(requestError)) })
    return () => { active = false }
  }, [range])

  if (isLoading || error) return <WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Your workspace data is unavailable." />
  if (!dashboard) return <WorkspaceDataState loading={isDashboardLoading} error={dashboardError} onRetry={refreshDashboard} empty="Your dashboard will appear when workspace data is available." />

  const stats = dashboard.stats
  return <div className="space-y-6">
    <PageHeading eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} title={`Good morning, ${workspace?.name?.split(' ')[0] || 'there'}`} description="Here’s your business at a glance." actions={<><Link to="/assistant" className={secondaryButton}><Sparkles size={14} /> Create invoice with AI</Link><Link to="/clients" className={primaryButton}><Plus size={15} /> Add client</Link></>} />
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"><MetricCard label="Total earnings" value={money(stats.totalEarnings, workspace?.defaultCurrency)} note="Paid invoices" icon={Wallet} tone="indigo" /><MetricCard label="Pending payments" value={money(stats.pendingPayments, workspace?.defaultCurrency)} note="Open invoices" icon={Clock3} tone="amber" /><MetricCard label="Total invoices" value={String(stats.totalInvoices)} note="Across your workspace" icon={FileText} tone="violet" /><MetricCard label="Clients" value={String(stats.totalClients)} note="In your directory" icon={Users} tone="emerald" /><MetricCard label="Projects" value={String(stats.totalProjects)} note={`${stats.activeProjects} active`} icon={BriefcaseBusiness} tone="indigo" /><MetricCard label="Overdue invoices" value={String(stats.overdueInvoices)} note="Need follow-up" icon={Clock3} tone="amber" /></section>
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.8fr)]"><div>{rangeError && <p className="mb-2 rounded-lg bg-rose-50 p-3 text-xs text-danger" role="alert">{rangeError}</p>}<RevenuePanel data={rangeData} range={range} setRange={setRange} currency={workspace?.defaultCurrency} /></div><Panel title="Upcoming deadlines" subtitle="Open invoices by due date" action={<Link className="text-[11px] font-bold text-brand hover:text-brand-hover" to="/invoices">View all</Link>}>
      {dashboard.upcomingDeadlines?.length ? <div className="divide-y divide-slate-100 px-4 sm:px-5">{dashboard.upcomingDeadlines.slice(0, 4).map((invoice) => <Link key={invoice._id} to={`/invoices/${invoice._id}`} className="flex gap-3 py-4"><div className="grid size-11 shrink-0 place-items-center rounded-lg bg-slate-50 text-center"><span className="block text-[15px] font-bold leading-none text-ink">{new Date(invoice.dueDate).getDate()}</span><span className="mt-1 text-[8px] font-bold tracking-wider text-muted">{new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-ink">{invoice.clientId?.companyName || invoice.clientId?.name}</div><div className="mt-1 text-[10px] text-muted">{invoice.invoiceNumber} · {dateLabel(invoice.dueDate)}</div></div><div className="text-xs font-bold text-ink">{money(invoice.totalAmount, invoice.currency)}</div></Link>)}</div> : <div className="px-5 py-10 text-center text-xs text-muted">No upcoming invoice deadlines.</div>}
    </Panel></section>
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]"><Panel title="Recent payments" subtitle="Completed payment activity">
      {dashboard.recentTransactions?.length ? <div className="overflow-x-auto"><table className="w-full min-w-140 text-left"><thead><tr className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400"><th className="px-5 py-3">Client</th><th className="px-4 py-3">Paid at</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{dashboard.recentTransactions.map((payment) => <tr key={payment._id} className="text-xs"><td className="px-5 py-3.5"><div className="font-bold text-ink">{payment.clientId?.companyName || payment.clientId?.name}</div><div className="mt-0.5 text-[10px] text-muted">{payment.invoiceId?.invoiceNumber}</div></td><td className="px-4 py-3.5 text-muted">{dateLabel(payment.paidAt)}</td><td className="px-5 py-3.5 text-right font-bold text-ink">{money(payment.amount, payment.currency)}</td></tr>)}</tbody></table></div> : <div className="px-5 py-10 text-center text-xs text-muted">Completed payments will appear here.</div>}
    </Panel><Panel title="Recent invoices" subtitle="Latest billing activity" action={<Link className="text-[11px] font-bold text-brand" to="/invoices">View all</Link>}>
      {dashboard.recentInvoices?.length ? <div className="divide-y divide-slate-100 px-4 sm:px-5">{dashboard.recentInvoices.slice(0, 4).map((invoice) => <Link key={invoice._id} to={`/invoices/${invoice._id}`} className="flex items-center gap-3 py-3.5"><FileText size={16} className="shrink-0 text-slate-400" /><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-ink">{invoice.clientId?.companyName || invoice.clientId?.name}</div><div className="mt-0.5 text-[10px] text-muted">{invoice.invoiceNumber} · due {dateLabel(invoice.dueDate)}</div></div><div className="text-right"><div className="text-xs font-bold text-ink">{money(invoice.totalAmount, invoice.currency)}</div><div className="mt-1"><StatusBadge status={invoice.status} /></div></div></Link>)}</div> : <div className="px-5 py-10 text-center text-xs text-muted">Create your first invoice to see it here.</div>}
    </Panel></section>
    <section className="grid gap-5 xl:grid-cols-2"><Panel title="Projects" subtitle={`${stats.totalProjects} projects across ${stats.totalClients} clients`} action={<Link className="text-[11px] font-bold text-brand" to="/projects">View all</Link>}>{dashboard.recentProjects?.length ? <div className="divide-y divide-slate-100">{dashboard.recentProjects.slice(0, 5).map((project) => <Link key={project._id} to={`/clients/${project.clientId?._id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-xs"><span><span className="block font-semibold text-ink">{project.name}</span><span className="mt-1 block text-[10px] text-muted">{project.clientId?.companyName || project.clientId?.name}</span></span><span className="flex items-center gap-3"><StatusBadge status={project.status} /><strong>{money(project.budget, project.currency)}</strong></span></Link>)}</div> : <p className="p-6 text-center text-xs text-muted">Create a project for one of your clients.</p>}</Panel><Panel title="Quick actions" subtitle="Manage your client work"><div className="grid gap-3 p-4"><QuickAction icon={Users} label="Add a client" to="/clients" tone="emerald" /><QuickAction icon={BriefcaseBusiness} label="Create a project" to="/projects" tone="violet" /><QuickAction icon={FilePlus2} label="Create invoice with AI" to="/assistant" /></div></Panel></section>
  </div>
}

function ClientForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save client' }) {
  const [values, setValues] = useState({ name: initial.name || '', email: initial.email || '', companyName: initial.companyName || '', phone: initial.phone || '', country: initial.country || '', address: initial.address || '', notes: initial.notes || '' })
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try { await onSubmit({ ...values, projects }); onCancel() } catch (requestError) { setError(errorMessage(requestError)) } finally { setSaving(false) }
  }
  const updateProject = (index, key, value) => setProjects((current) => current.map((project, itemIndex) => itemIndex === index ? { ...project, [key]: value } : project))
  return <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
    {[['name', 'Client name', 'text'], ['companyName', 'Company', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'], ['country', 'Country', 'text']].map(([key, label, type]) => <label key={key} className="grid gap-1 text-[11px] font-semibold text-slate-600">{label}<input className="h-10 rounded-lg border border-line px-3 text-xs font-normal text-ink outline-none focus:border-indigo-400" required={key === 'name' || key === 'email'} type={type} value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} /></label>)}
    <label className="grid gap-1 text-[11px] font-semibold text-slate-600 sm:col-span-2">Address<input className="h-10 rounded-lg border border-line px-3 text-xs font-normal text-ink outline-none focus:border-indigo-400" value={values.address} onChange={(event) => setValues({ ...values, address: event.target.value })} /></label>
    <label className="grid gap-1 text-[11px] font-semibold text-slate-600 sm:col-span-2">Notes<textarea className="min-h-20 rounded-lg border border-line px-3 py-2 text-xs font-normal text-ink outline-none focus:border-indigo-400" value={values.notes} onChange={(event) => setValues({ ...values, notes: event.target.value })} /></label>
    {!initial.id && <section className="space-y-3 rounded-lg border border-line p-3 sm:col-span-2">
      <div className="flex items-center justify-between"><div><h3 className="text-xs font-bold text-ink">Projects for this client</h3><p className="mt-1 text-[10px] text-muted">Add one or more projects, or skip for now.</p></div><button className={secondaryButton} onClick={() => setProjects([...projects, { name: '', description: '', budget: '', currency: 'USD', dueDate: '' }])} type="button"><Plus size={13} /> Add project</button></div>
      {projects.map((project, index) => <div key={index} className="grid gap-2 rounded-md bg-slate-50 p-3 sm:grid-cols-2">
        <label className="grid gap-1 text-[10px] font-semibold text-slate-600 sm:col-span-2">Project name<input className="h-9 rounded-md border border-line bg-white px-2 text-xs font-normal text-ink" maxLength={160} required value={project.name} onChange={(event) => updateProject(index, 'name', event.target.value)} /></label>
        <label className="grid gap-1 text-[10px] font-semibold text-slate-600">Budget<input className="h-9 rounded-md border border-line bg-white px-2 text-xs font-normal text-ink" min="0" step="0.01" required type="number" value={project.budget} onChange={(event) => updateProject(index, 'budget', event.target.value)} /></label>
        <label className="grid gap-1 text-[10px] font-semibold text-slate-600">Currency<select className="h-9 rounded-md border border-line bg-white px-2 text-xs font-normal text-ink" value={project.currency} onChange={(event) => updateProject(index, 'currency', event.target.value)}>{['USD', 'EUR', 'GBP', 'CAD'].map((currency) => <option key={currency}>{currency}</option>)}</select></label>
        <label className="grid gap-1 text-[10px] font-semibold text-slate-600">Due date<input className="h-9 rounded-md border border-line bg-white px-2 text-xs font-normal text-ink" type="date" value={project.dueDate} onChange={(event) => updateProject(index, 'dueDate', event.target.value)} /></label>
        <label className="grid gap-1 text-[10px] font-semibold text-slate-600 sm:col-span-2">Description<textarea className="min-h-16 rounded-md border border-line bg-white px-2 py-2 text-xs font-normal text-ink" maxLength={4000} value={project.description} onChange={(event) => updateProject(index, 'description', event.target.value)} /></label>
        <button className="justify-self-start text-[10px] font-semibold text-danger hover:underline sm:col-span-2" onClick={() => setProjects(projects.filter((_, itemIndex) => itemIndex !== index))} type="button">Remove project</button>
      </div>)}
    </section>}
    {error && <p className="text-xs text-danger sm:col-span-2" role="alert">{error}</p>}
    <div className="flex justify-end gap-2 sm:col-span-2"><button className={secondaryButton} onClick={onCancel} type="button">Cancel</button><button className={primaryButton} disabled={saving} type="submit">{saving ? 'Saving…' : submitLabel}</button></div>
  </form>
}

export function ClientsPage() {
  const { clients, createClient, updateClient, isLoading, error, refreshWorkspace, notify } = useWorkspace()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const rows = clients.filter((client) => `${client.name} ${client.companyName} ${client.email}`.toLowerCase().includes(search.toLowerCase()))
  const remove = async (client) => {
    if (!window.confirm(`Delete ${client.name}?`)) return
    try { await api.delete(`/clients/${client.id}`); notify('Client deleted'); await refreshWorkspace() } catch (requestError) { notify(errorMessage(requestError)) }
  }
  return <div><PageHeading eyebrow="Relationships that grow" title="Clients" description="Your client book, synced with your workspace." actions={<button className={primaryButton} onClick={() => { setEditing(null); setAdding(!adding) }}><Plus size={15} /> Add client</button>} />
    {(adding || editing) && <Panel className="mb-5 p-5" title={editing ? `Edit ${editing.name}` : 'Add a client'} subtitle="Clients are contacts, not application accounts."><ClientForm key={editing?.id || 'new-client'} initial={editing || {}} onSubmit={(values) => editing ? updateClient(editing.id, values) : createClient(values)} onCancel={() => { setAdding(false); setEditing(null) }} submitLabel={editing ? 'Update client' : 'Save client'} /></Panel>}
    <WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Add your first client to start tracking projects and invoices.">
      {!clients.length ? null : <Panel className="overflow-hidden" title="Client directory" subtitle={`${clients.length} clients`} action={<label className="flex h-8 items-center gap-2 rounded-md border border-line px-2.5 text-muted"><Search size={13} /><input className="w-32 bg-transparent text-[10px] text-ink outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search clients" value={search} /></label>}><div className="overflow-x-auto"><table className="w-full min-w-175 text-left"><thead><tr className="bg-slate-50/70 text-[9px] font-bold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Client</th><th className="px-4 py-3">Contact</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((client) => <tr key={client.id} className="text-xs hover:bg-slate-50/70"><td className="px-5 py-4"><Link to={`/clients/${client.id}`} className="flex items-center gap-3"><Avatar initials={client.name.slice(0, 1).toUpperCase()} /><span><span className="block font-bold text-ink">{client.companyName || client.name}</span><span className="mt-0.5 block text-[10px] text-muted">{client.name}</span></span></Link></td><td className="px-4 py-4"><div className="font-semibold text-slate-700">{client.email}</div><div className="mt-0.5 text-[10px] text-muted">{client.country || client.phone || 'No contact details'}</div></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-3"><button className="text-[10px] font-semibold text-brand hover:underline" onClick={() => { setAdding(false); setEditing(client) }}>Edit</button><button className="text-[10px] font-semibold text-danger hover:underline" onClick={() => remove(client)}>Delete</button></div></td></tr>)}</tbody></table></div>{!rows.length && <p className="p-8 text-center text-xs text-muted">No clients match that search.</p>}</Panel>}
    </WorkspaceDataState>
  </div>
}

export function ClientDetailsPage() {
  const { clientId } = useParams()
  const { clients, projects, invoices, isLoading, error, refreshWorkspace } = useWorkspace()
  const client = clients.find((record) => record.id === clientId)
  const clientProjects = projects.filter((project) => project.clientId?.id === clientId || project.clientId === clientId)
  const clientInvoices = invoices.filter((invoice) => invoice.clientId?.id === clientId || invoice.clientId === clientId)
  return <div><Link to="/clients" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted"><ArrowLeft size={14} /> Clients</Link><WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="This client was not found.">{client && <><PageHeading title={client.companyName || client.name} description={`${client.name} · ${client.email}`} actions={<><Link to={`/projects?clientId=${client.id}`} className={secondaryButton}><Plus size={14} /> Add project</Link><Link to={`/assistant?clientId=${client.id}`} className={primaryButton}><Plus size={14} /> Create invoice with AI</Link></>} /><Panel title="Client details" subtitle="Contact information"><div className="grid gap-4 p-5 text-xs sm:grid-cols-2"><div><span className="text-muted">Email</span><p className="mt-1 font-semibold text-ink">{client.email}</p></div><div><span className="text-muted">Phone</span><p className="mt-1 font-semibold text-ink">{client.phone || '—'}</p></div><div><span className="text-muted">Country</span><p className="mt-1 font-semibold text-ink">{client.country || '—'}</p></div><div><span className="text-muted">Address</span><p className="mt-1 font-semibold text-ink">{client.address || '—'}</p></div><div className="sm:col-span-2"><span className="text-muted">Notes</span><p className="mt-1 font-semibold text-ink">{client.notes || 'No notes yet.'}</p></div></div></Panel><Panel className="mt-5" title="Projects" subtitle={`${clientProjects.length} projects for this client`}>{clientProjects.length ? <div className="divide-y divide-slate-100">{clientProjects.map((project) => <Link key={project.id} to={`/projects?edit=${project.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-xs"><span><span className="block font-semibold text-brand">{project.name}</span><span className="mt-1 block text-[10px] text-muted">{project.description || 'No description'}</span></span><span className="flex items-center gap-3"><StatusBadge status={project.status} /><strong>{money(project.budget, project.currency)}</strong></span></Link>)}</div> : <p className="p-6 text-center text-xs text-muted">No projects for this client yet.</p>}</Panel><Panel className="mt-5" title="Invoices" subtitle={`${clientInvoices.length} related invoices`}>{clientInvoices.length ? clientInvoices.map((invoice) => <Link key={invoice.id} to={`/invoices/${invoice.id}`} className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-xs last:border-0"><span className="font-semibold text-brand">{invoice.invoiceNumber} · {invoice.title}</span><span className="flex items-center gap-3"><StatusBadge status={invoice.status} /><strong>{money(invoice.totalAmount, invoice.currency)}</strong></span></Link>) : <p className="p-6 text-center text-xs text-muted">No invoices for this client yet.</p>}</Panel></>}</WorkspaceDataState></div>
}

export function ProjectsPage() {
  const { projects, clients, createProject, isLoading, error, refreshWorkspace } = useWorkspace()
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState({ clientId: '', name: '', description: '', budget: '', currency: 'USD', dueDate: '' })
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setFormError('')
    try { await createProject({ ...values, budget: Number(values.budget) }); setAdding(false); setValues({ clientId: '', name: '', description: '', budget: '', currency: 'USD', dueDate: '' }) } catch (requestError) { setFormError(errorMessage(requestError)) } finally { setSaving(false) }
  }
  return <div><PageHeading eyebrow="Make good work happen" title="Projects" description="Track scope, progress, and deadlines across your freelance work." actions={<button onClick={() => setAdding(!adding)} className={primaryButton}><Plus size={15} /> New project</button>} />
    {adding && <Panel className="mb-5 p-5" title="Create a project"><form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}><label className="grid gap-1 text-[11px] font-semibold text-slate-600">Client<select required value={values.clientId} onChange={(event) => setValues({ ...values, clientId: event.target.value })} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal"><option value="">Select a client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.companyName || client.name}</option>)}</select></label><label className="grid gap-1 text-[11px] font-semibold text-slate-600">Project name<input required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} className="h-10 rounded-lg border border-line px-3 text-xs font-normal" /></label><label className="grid gap-1 text-[11px] font-semibold text-slate-600">Budget (USD)<input required min="0.01" type="number" value={values.budget} onChange={(event) => setValues({ ...values, budget: event.target.value })} className="h-10 rounded-lg border border-line px-3 text-xs font-normal" /></label><label className="grid gap-1 text-[11px] font-semibold text-slate-600">Due date<input type="date" value={values.dueDate} onChange={(event) => setValues({ ...values, dueDate: event.target.value })} className="h-10 rounded-lg border border-line px-3 text-xs font-normal" /></label>{formError && <p className="text-xs text-danger sm:col-span-2">{formError}</p>}<div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className={secondaryButton} onClick={() => setAdding(false)}>Cancel</button><button disabled={saving || !clients.length} className={primaryButton}>{saving ? 'Saving…' : 'Create project'}</button></div></form></Panel>}
    <WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Add a client first, then create your first project.">{projects.length ? <div className="grid gap-3 lg:grid-cols-2">{projects.map((project) => <article key={project.id} className="rounded-xl border border-line bg-white p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-indigo-50 text-brand"><BriefcaseBusiness size={17} /></span><div><h3 className="text-sm font-bold text-ink">{project.name}</h3><p className="mt-1 text-[11px] text-muted">{project.clientId?.companyName || project.clientId?.name}</p></div></div><StatusBadge status={project.status} /></div><p className="mt-4 line-clamp-2 text-xs leading-relaxed text-muted">{project.description || 'No project description.'}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] text-muted"><span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> Due {dateLabel(project.dueDate)}</span><span className="text-xs font-bold text-ink">{money(project.budget, project.currency)}</span></div></article>)}</div> : null}</WorkspaceDataState>
  </div>
}

function InvoiceTable({ rows, onShare, onSend, onDelete }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-205 text-left"><thead><tr className="border-b border-line bg-slate-50/70 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400"><th className="px-5 py-3">Invoice</th><th className="px-4 py-3">Client / project</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((invoice) => <tr key={invoice.id} className="text-xs transition hover:bg-slate-50/70"><td className="px-5 py-4"><Link className="font-bold text-brand hover:underline" to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link></td><td className="px-4 py-4"><div className="font-semibold text-ink">{invoice.clientId?.companyName || invoice.clientId?.name}</div><div className="mt-0.5 text-[10px] text-muted">{invoice.title}</div></td><td className="px-4 py-4 text-muted">{dateLabel(invoice.issueDate)}</td><td className="px-4 py-4 text-muted">{dateLabel(invoice.dueDate)}</td><td className="px-4 py-4"><StatusBadge status={invoice.status} /></td><td className="px-4 py-4 text-right font-bold text-ink">{money(invoice.totalAmount, invoice.currency)}</td><td className="px-4 py-4"><div className="flex items-center justify-end gap-1">{invoice.status === 'Draft' && <button className="rounded-md px-2 py-1 text-[10px] font-bold text-brand hover:bg-indigo-50" onClick={() => onSend(invoice)}>Send</button>}<Link aria-label={`View ${invoice.invoiceNumber}`} title="View invoice" to={`/invoices/${invoice.id}`} className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-indigo-50 hover:text-brand"><ArrowRight size={15} /></Link><button aria-label={`Share ${invoice.invoiceNumber}`} title="Share invoice" onClick={() => onShare(invoice)} className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-ink"><Copy size={14} /></button><button aria-label={`Download ${invoice.invoiceNumber}`} title="Download PDF" onClick={() => window.print()} className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-ink"><ArrowDownToLine size={15} /></button><button aria-label={`Delete ${invoice.invoiceNumber}`} className="px-1 text-[10px] text-danger" onClick={() => onDelete(invoice)}>×</button></div></td></tr>)}</tbody></table></div>
}

export function InvoicesPage() {
  const { invoices, isLoading, error, refreshWorkspace, notify } = useWorkspace()
  const [filter, setFilter] = useState('All')
  const [searchParams] = useSearchParams()
  const query = searchParams.get('search')?.toLowerCase() || ''
  const filters = ['All', 'Pending', 'Paid', 'Overdue', 'Draft']
  const rows = invoices.filter((invoice) => (filter === 'All' || invoice.status === filter) && (!query || `${invoice.invoiceNumber} ${invoice.title} ${invoice.clientId?.name} ${invoice.clientId?.companyName}`.toLowerCase().includes(query)))
  const share = async (invoice) => {
    try {
      const link = `${window.location.origin}/public/invoices/${invoice.publicToken}`
      await navigator.clipboard.writeText(link)
      if (invoice.status === 'Draft') await api.patch(`/invoices/${invoice.id}`, { status: 'Pending' })
      notify('PayPal payment link copied')
      await refreshWorkspace()
    } catch (requestError) { notify(requestError.response?.data?.error || 'Could not copy the payment link.') }
  }
  const send = async (invoice) => {
    try { await api.patch(`/invoices/${invoice.id}`, { status: 'Pending' }); notify(`${invoice.invoiceNumber} marked as sent`); await refreshWorkspace() } catch (requestError) { notify(errorMessage(requestError)) }
  }
  const remove = async (invoice) => {
    if (!window.confirm(`Delete ${invoice.invoiceNumber}?`)) return
    try { await api.delete(`/invoices/${invoice.id}`); notify('Invoice deleted'); await refreshWorkspace() } catch (requestError) { notify(errorMessage(requestError)) }
  }
  const outstanding = invoices.filter((invoice) => ['Pending', 'Overdue'].includes(invoice.status)).reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  return <div><PageHeading eyebrow="Your money, organized" title="Invoices" description="Create, share and track invoices for your clients." actions={<Link to="/assistant" className={primaryButton}><Sparkles size={15} /> Create invoice with AI</Link>} />
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Outstanding', money(outstanding), 'text-amber-600'], ['Paid invoices', String(invoices.filter((invoice) => invoice.status === 'Paid').length), 'text-success'], ['Overdue', String(invoices.filter((invoice) => invoice.status === 'Overdue').length), 'text-danger'], ['Drafts', String(invoices.filter((invoice) => invoice.status === 'Draft').length), 'text-slate-700']].map(([label, amount, tone]) => <div key={label} className="rounded-xl border border-line bg-white px-4 py-3.5"><div className="text-[10px] font-medium text-muted">{label}</div><div className={`mt-1 text-lg font-bold ${tone}`}>{amount}</div></div>)}</div>
    <Panel className="overflow-hidden" title="All invoices" subtitle={`${rows.length} invoices`} action={<span className="inline-flex items-center gap-1 text-[10px] text-muted"><Filter size={13} /> Filter by status</span>}><div className="flex gap-1 overflow-x-auto border-b border-line px-4 pt-3 sm:px-5">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 border-b-2 px-3 pb-2.5 text-[11px] font-semibold ${filter === item ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>{item}</button>)}</div><WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Create an invoice for a client to start tracking payments.">{rows.length ? <InvoiceTable rows={rows} onShare={share} onSend={send} onDelete={remove} /> : null}</WorkspaceDataState></Panel>
  </div>
}

export function CreateInvoicePage() {
  const { clients, projects, createInvoice, isLoading } = useWorkspace()
  const navigate = useNavigate()
  const [values, setValues] = useState({ clientId: '', projectId: '', title: '', description: '', amount: '', dueDate: '', currency: 'USD' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const availableProjects = projects.filter((project) => !values.clientId || project.clientId?.id === values.clientId)
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const amount = Number(values.amount)
      const invoice = await createInvoice({ ...values, items: [{ description: values.title, quantity: 1, rate: amount }] })
      navigate(`/invoices/${invoice.id}`)
    } catch (requestError) { setError(errorMessage(requestError)) } finally { setSaving(false) }
  }
  return <div className="mx-auto max-w-3xl"><Link to="/invoices" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted"><ArrowLeft size={14} /> Back to invoices</Link><PageHeading eyebrow="Get paid with confidence" title="Create an invoice" description="Choose a saved client, set the scope and due date, then review before sharing." />
    <form onSubmit={submit} className="space-y-5"><Panel title="Client and project" subtitle="Use an existing client from your workspace"><div className="grid gap-4 p-5 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-semibold text-slate-700">Client<select required value={values.clientId} onChange={(event) => setValues({ ...values, clientId: event.target.value, projectId: '' })} className="h-10 rounded-lg border border-line bg-white px-3 font-normal"><option value="">Select a client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.companyName || client.name}</option>)}</select></label><label className="grid gap-1.5 text-xs font-semibold text-slate-700">Project<select value={values.projectId} onChange={(event) => setValues({ ...values, projectId: event.target.value })} className="h-10 rounded-lg border border-line bg-white px-3 font-normal"><option value="">No project</option>{availableProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div></Panel>
      <Panel title="Invoice details" subtitle="Add at least one service line"><div className="grid gap-4 p-5 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">Service or project<input required maxLength={160} value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} placeholder="Website design and development" className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-indigo-400" /></label><label className="grid gap-1.5 text-xs font-semibold text-slate-700">Amount<input required min="0.01" step="0.01" type="number" value={values.amount} onChange={(event) => setValues({ ...values, amount: event.target.value })} placeholder="800.00" className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-indigo-400" /></label><label className="grid gap-1.5 text-xs font-semibold text-slate-700">Due date<input required type="date" value={values.dueDate} onChange={(event) => setValues({ ...values, dueDate: event.target.value })} className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-indigo-400" /></label><label className="grid gap-1.5 text-xs font-semibold text-slate-700">Currency<select value={values.currency} onChange={(event) => setValues({ ...values, currency: event.target.value })} className="h-10 rounded-lg border border-line bg-white px-3 font-normal"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option></select></label><label className="grid gap-1.5 text-xs font-semibold text-slate-700">Notes<input maxLength={4000} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} placeholder="Payment terms or extra context" className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-indigo-400" /></label>{error && <p className="text-xs text-danger sm:col-span-2" role="alert">{error}</p>}</div></Panel>
      <div className="flex justify-end gap-2"><Link to="/invoices" className={secondaryButton}>Cancel</Link><button disabled={saving || isLoading || !clients.length} type="submit" className={primaryButton}><FilePlus2 size={14} />{saving ? 'Creating…' : 'Create draft'}</button></div>
    </form>
  </div>
}

function InvoiceDocument({ invoice, workspace, client, publicToken, publicView = false }) {
  const { notify, refreshWorkspace } = useWorkspace()
  const share = async () => {
    try {
      const link = `${window.location.origin}/public/invoices/${publicToken || invoice.publicToken}`
      await navigator.clipboard.writeText(link)
      if (!publicView && invoice.status === 'Draft') {
        await api.patch(`/invoices/${invoice.id}`, { status: 'Pending' })
        await refreshWorkspace()
      }
      notify('PayPal payment link copied')
    } catch (requestError) {
      notify(requestError.response?.data?.error || 'Could not copy the payment link.')
    }
  }
  return <article className="print:shadow-none mx-auto max-w-4xl rounded-xl border border-line bg-white p-6 shadow-[0_8px_32px_rgba(16,24,40,0.05)] sm:p-10"><header className="flex flex-col justify-between gap-6 border-b border-line pb-7 sm:flex-row"><div><div className="flex items-center gap-2 text-sm font-extrabold text-ink"><span className="grid size-8 place-items-center rounded-lg bg-brand text-white"><Wallet size={16} /></span>{workspace?.businessName || workspace?.name}</div><p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-muted">{workspace?.businessAddress || 'Business address not set'}<br />{workspace?.businessEmail || ''}</p></div><div className="sm:text-right"><div className="font-display text-2xl font-bold text-ink">INVOICE</div><div className="mt-2 text-sm font-bold text-brand">{invoice.invoiceNumber}</div><div className="mt-1"><StatusBadge status={invoice.status} /></div></div></header>
    <div className="grid gap-6 py-7 sm:grid-cols-3"><div><div className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Billed to</div><div className="mt-2 text-sm font-bold text-ink">{client?.companyName || client?.name}</div><div className="mt-1 text-xs text-muted">{client?.email}</div></div><div><div className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Issue date</div><div className="mt-2 text-sm font-semibold text-ink">{dateLabel(invoice.issueDate)}</div></div><div><div className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Due date</div><div className="mt-2 text-sm font-semibold text-ink">{dateLabel(invoice.dueDate)}</div></div></div>
    <div className="overflow-x-auto"><table className="w-full min-w-105 text-left"><thead><tr className="border-y border-line text-[9px] font-bold uppercase tracking-[0.12em] text-muted"><th className="py-3">Description</th><th className="px-3 py-3 text-right">Qty</th><th className="px-3 py-3 text-right">Rate</th><th className="py-3 text-right">Amount</th></tr></thead><tbody>{invoice.items?.map((item, index) => <tr key={`${item.description}-${index}`} className="border-b border-line text-xs"><td className="py-4 font-semibold text-ink">{item.description}</td><td className="px-3 py-4 text-right text-muted">{item.quantity}</td><td className="px-3 py-4 text-right text-muted">{money(item.rate, invoice.currency)}</td><td className="py-4 text-right font-bold text-ink">{money(item.amount, invoice.currency)}</td></tr>)}</tbody></table></div>
    <div className="flex justify-end py-6"><div className="w-full max-w-62.5 space-y-2"><div className="flex justify-between text-xs text-muted"><span>Subtotal</span><span>{money(invoice.subtotal, invoice.currency)}</span></div>{invoice.tax > 0 && <div className="flex justify-between text-xs text-muted"><span>Tax</span><span>{money(invoice.tax, invoice.currency)}</span></div>}{invoice.discount > 0 && <div className="flex justify-between text-xs text-muted"><span>Discount</span><span>−{money(invoice.discount, invoice.currency)}</span></div>}<div className="flex justify-between border-t border-line pt-3 text-sm font-bold text-ink"><span>Total due</span><span>{money(invoice.totalAmount, invoice.currency)}</span></div></div></div>
    <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-md text-[11px] leading-relaxed text-muted">{invoice.description || 'Thank you for your business. Please include the invoice number with your payment.'}</p><div className="flex flex-wrap gap-2">{!publicView && <button className={secondaryButton} onClick={() => window.print()}><ArrowDownToLine size={14} /> Download PDF</button>}<button className={secondaryButton} onClick={share}><Copy size={14} /> Copy payment link</button>{publicView && invoice.status !== 'Paid' && <PayPalButton amount={invoice.totalAmount} publicToken={publicToken || invoice.publicToken} />}</div></div>
  </article>
}

export function InvoiceDetailsPage() {
  const { invoiceId } = useParams()
  const { invoices, workspace, isLoading, error, refreshWorkspace, notify } = useWorkspace()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const invoice = invoices.find((record) => record.id === invoiceId)
  const updateInvoice = async (updates) => {
    await api.patch(`/invoices/${invoiceId}`, updates)
    setEditing(false); notify('Invoice updated'); await refreshWorkspace()
  }
  if (isLoading || error) return <WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Invoice could not be loaded." />
  if (!invoice) return <div className="py-20 text-center"><h2 className="text-lg font-bold">Invoice not found</h2><Link to="/invoices" className="mt-3 inline-block text-sm font-bold text-brand">Back to invoices</Link></div>
  return <div><Link to="/invoices" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted"><ArrowLeft size={14} /> All invoices</Link><div className="mb-4 flex justify-end"><button className={secondaryButton} onClick={() => { setTitle(invoice.title); setEditing(!editing) }}>Edit invoice</button></div>{editing && <form className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-line bg-white p-4" onSubmit={(event) => { event.preventDefault(); updateInvoice({ title }) }}><label className="grid flex-1 gap-1 text-[10px] font-semibold text-muted">Invoice title<input value={title} onChange={(event) => setTitle(event.target.value)} className="h-9 min-w-48 rounded-md border border-line px-3 text-xs text-ink" /></label><button className={primaryButton}>Save changes</button></form>}<InvoiceDocument invoice={invoice} workspace={workspace} client={invoice.clientId} /></div>
}

export function PublicInvoicePage() {
  const { invoiceId: token } = useParams()
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentMessage, setPaymentMessage] = useState('')
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data } = await api.get(`/public/invoices/${token}`)
        if (active) setInvoiceData(data)
        const params = new URLSearchParams(window.location.search)
        const orderId = params.get('token')
        if (params.get('payment') === 'returning') {
          window.history.replaceState({}, '', window.location.pathname)
          if (!orderId) {
            if (active) setPaymentMessage('Could not confirm payment because PayPal did not return an order reference. Contact the business before trying again.')
            return
          }
          try {
            const { data: capture } = await api.post(`/public/invoices/${token}/capture-order`, { orderId })
            if (capture.status !== 'COMPLETED') throw new Error('PayPal has not confirmed this payment yet.')
            const { data: updatedInvoice } = await api.get(`/public/invoices/${token}`)
            if (active) {
              setInvoiceData(updatedInvoice)
              setPaymentMessage('Payment successful! Your invoice is paid. Thank you.')
            }
          } catch (paymentError) {
            if (active) setPaymentMessage(errorMessage(paymentError))
          }
        } else if (params.get('payment') === 'cancelled') {
          window.history.replaceState({}, '', window.location.pathname)
          if (active) setPaymentMessage('Payment was cancelled. This invoice is still unpaid.')
        }
      } catch (requestError) {
        if (active) setError(errorMessage(requestError))
      } finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [token])
  if (loading || error || !invoiceData) return <main className="min-h-screen bg-canvas px-4 py-12"><div className="mx-auto max-w-3xl"><WorkspaceDataState loading={loading} error={error} empty="This public invoice could not be found." /></div></main>
  return <main className="min-h-screen bg-canvas px-4 py-8 sm:px-8 sm:py-12"><div className="mx-auto mb-5 flex max-w-4xl items-center gap-2 text-[11px] font-semibold text-muted"><Globe2 size={14} /> Secure invoice · {invoiceData.invoice.invoiceNumber}</div>{paymentMessage && <p className={`mx-auto mb-4 flex max-w-4xl items-center gap-2 rounded-lg p-4 text-sm font-bold ${invoiceData.invoice.status === 'Paid' ? 'bg-emerald-50 text-success' : 'bg-amber-50 text-amber-800'}`} role="status">{invoiceData.invoice.status === 'Paid' && <Check size={18} />}{paymentMessage}</p>}<InvoiceDocument invoice={normalizeRecord(invoiceData.invoice)} client={invoiceData.client} workspace={invoiceData.workspace} publicToken={token} publicView /></main>
}

export function PaymentsPage() {
  const { payments, isLoading, error, refreshWorkspace } = useWorkspace()
  return <div><PageHeading eyebrow="Money in motion" title="Payments" description="See what has landed and what’s still on its way." /><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><MetricCard label="Completed payments" value={String(payments.filter((payment) => payment.status === 'COMPLETED').length)} note="Across invoices" icon={Banknote} tone="emerald" /><MetricCard label="On the way" value={String(payments.filter((payment) => payment.status === 'CREATED').length)} note="Open PayPal orders" icon={Clock3} tone="amber" /><MetricCard label="Total received" value={money(payments.filter((payment) => payment.status === 'COMPLETED').reduce((sum, payment) => sum + payment.amount, 0))} note="Completed captures" icon={TrendingUp} tone="indigo" /></div><div className="mt-5"><Panel title="Payment activity" subtitle="Payments recorded against your invoices"><WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Payments appear here after an invoice has been paid.">{payments.length ? <div className="divide-y divide-slate-100">{payments.map((payment) => <div key={payment.id} className="flex items-center gap-3 px-5 py-4"><span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-brand"><CreditCard size={16} /></span><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-ink">{payment.clientId?.companyName || payment.clientId?.name}</div><div className="mt-1 text-[10px] text-muted">{payment.invoiceId?.invoiceNumber} · {dateLabel(payment.paidAt || payment.createdAt)}</div></div><div className="text-right"><div className="text-xs font-bold text-ink">{money(payment.amount, payment.currency)}</div><div className="mt-1 text-[9px] text-muted">{payment.provider} · {payment.status}</div></div></div>)}</div> : null}</WorkspaceDataState></Panel></div></div>
}

export function AIAssistantPage() {
  const { clients, projects, createInvoice, isLoading } = useWorkspace()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '')
  const [projectId, setProjectId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState(null)
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
  const availableProjects = projects.filter((project) => project.clientId?.id === (draft?.clientId || clientId))
  const suggestions = [
    'Website design and development, 3 pages, $800, due in 14 days.',
    'Monthly consulting, 10 hours at $90 per hour, due next month.',
    'Brand identity package with logo, color palette and usage guide for $1,200.',
  ]
  const generate = async (text = prompt) => {
    if (!text.trim()) return
    if (!clientId) { setError('Choose a client before generating an invoice.'); return }
    setPrompt(text)
    setThinking(true)
    setError('')
    try {
      const { data } = await api.post('/ai/invoice-draft', { prompt: text, clientId })
      setDraft({ ...data.draft, projectId })
    } catch (requestError) {
      setError(errorMessage(requestError))
      setDraft(null)
    } finally {
      setThinking(false)
    }
  }
  const approve = async () => {
    if (!draft?.clientId) { setError('Select an existing client before creating this invoice.'); return }
    try {
      const invoice = await createInvoice({
        clientId: draft.clientId,
        projectId,
        title: draft.title,
        description: draft.description,
        dueDate: draft.dueDate,
        currency: draft.currency,
        tax: Number(draft.tax),
        discount: Number(draft.discount),
        items: draft.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      })
      navigate(`/invoices/${invoice.id}`)
    } catch (requestError) { setError(errorMessage(requestError)) }
  }
  const subtotal = draft
    ? Math.round(draft.items.reduce((sum, item) => sum + Math.round(Number(item.quantity) * Number(item.rate) * 100) / 100, 0) * 100) / 100
    : 0
  const total = draft ? Math.round((subtotal + Number(draft.tax) - Number(draft.discount)) * 100) / 100 : 0
  const canCreateInvoice = Boolean(draft
    && !isLoading
    && draft.clientId
    && draft.title.trim()
    && draft.dueDate
    && draft.items.length
    && draft.items.every((item) => item.description.trim().length <= 300 && Number.isFinite(item.quantity) && item.quantity > 0 && Number.isFinite(item.rate) && item.rate >= 0)
    && Number.isFinite(draft.tax)
    && draft.tax >= 0
    && Number.isFinite(draft.discount)
    && draft.discount >= 0
    && draft.discount <= subtotal
    && Number.isFinite(total)
    && total > 0)
  const selectedClient = clients.find((client) => client.id === (draft?.clientId || clientId))
  return <div><PageHeading eyebrow="Invoice creation" title="Create invoice with AI" description="Describe the work, review the generated line items, then save the invoice." actions={<span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold text-ai"><Sparkles size={12} /> Groq AI</span>} /><div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.8fr)]"><section className="overflow-hidden rounded-xl border border-violet-100 bg-white"><div className="flex items-center gap-3 border-b border-slate-100 bg-violet-50/40 px-5 py-4"><span className="grid size-9 place-items-center rounded-lg bg-violet-100 text-ai"><WandSparkles size={18} /></span><div><div className="text-xs font-bold text-ink">Invoice drafting</div><div className="mt-0.5 text-[10px] text-muted">AI suggestions are editable and are not saved until you approve.</div></div></div>  <div className="min-h-67.5 space-y-4 p-5"><div className="max-w-[85%] rounded-xl rounded-tl-sm bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">Choose a client and describe the service, price, quantity and due date.</div>{prompt && <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-brand px-4 py-3 text-xs leading-relaxed text-white">{prompt}</div>}{thinking && <div className="text-xs text-muted">Generating invoice draft with Groq…</div>}{draft && <div className="max-w-[92%] rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-xs text-slate-700">Draft generated for {selectedClient?.companyName || selectedClient?.name || 'your client'}. Review the details before saving.</div>}{error && <p className="text-xs text-danger" role="alert">{error}</p>}</div><div className="border-t border-slate-100 p-4 sm:p-5"><label className="mb-3 grid gap-1 text-[10px] font-bold text-muted">CLIENT<select className="h-10 rounded-md border border-line bg-white px-3 text-xs font-medium text-ink" disabled={thinking} value={clientId} onChange={(event) => { setClientId(event.target.value); setProjectId(''); setDraft(null) }}><option value="">Choose a client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.companyName || client.name}</option>)}</select></label><label className="mb-3 grid gap-1 text-[10px] font-bold text-muted">PROJECT<select className="h-10 rounded-md border border-line bg-white px-3 text-xs font-medium text-ink disabled:bg-slate-50" disabled={thinking || !clientId} value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">No project</option>{projects.filter((project) => project.clientId?.id === clientId).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><div className="flex items-end gap-2 rounded-xl border border-line p-2 focus-within:border-violet-300"><textarea aria-label="Describe your invoice" className="max-h-32 min-h-11 flex-1 resize-y px-2 py-2 text-xs outline-none" onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); generate() } }} placeholder="Describe services, amount and due date..." value={prompt} /><button aria-label="Generate invoice draft" className="grid size-9 place-items-center rounded-lg bg-brand text-white hover:bg-brand-hover disabled:opacity-50" disabled={thinking || !clients.length} onClick={() => generate()}><Send size={15} /></button></div>{!clients.length && <Link className="mt-2 inline-block text-[11px] font-semibold text-brand" to="/clients">Add a client first</Link>}<div className="mt-3 flex flex-wrap gap-2">{suggestions.map((suggestion) => <button key={suggestion} disabled={thinking || !clients.length} onClick={() => generate(suggestion)} className="rounded-full border border-line px-3 py-1.5 text-left text-[10px] text-slate-600 hover:border-violet-200 hover:bg-violet-50 disabled:opacity-50">{suggestion}</button>)}</div></div></section>
    <div className="space-y-4">{draft ? <Panel title="Invoice preview" subtitle="Review and edit before saving"><div className="space-y-3 p-5"><label className="grid gap-1 text-[10px] font-bold text-muted">CLIENT<select className="h-9 rounded-md border border-line bg-white px-2 text-xs font-medium text-ink" value={draft.clientId} onChange={(event) => { setClientId(event.target.value); setProjectId(''); setDraft({ ...draft, clientId: event.target.value, projectId: '' }) }}><option value="">Choose a client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.companyName || client.name}</option>)}</select></label><label className="grid gap-1 text-[10px] font-bold text-muted">PROJECT<select className="h-9 rounded-md border border-line bg-white px-2 text-xs font-medium text-ink disabled:bg-slate-50" disabled={!draft.clientId} value={draft.projectId || ''} onChange={(event) => { setProjectId(event.target.value); setDraft({ ...draft, projectId: event.target.value }) }}><option value="">No project</option>{availableProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="grid gap-1 text-[10px] font-bold text-muted">TITLE<input maxLength={160} className="h-9 rounded-md border border-line px-2 text-xs font-medium text-ink" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label className="grid gap-1 text-[10px] font-bold text-muted">DESCRIPTION<textarea maxLength={4000} className="min-h-16 rounded-md border border-line px-2 py-2 text-xs font-medium text-ink" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><label className="grid gap-1 text-[10px] font-bold text-muted">DUE DATE<input className="h-9 rounded-md border border-line px-2 text-xs font-medium text-ink" type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label><div className="space-y-2 border-y border-line py-3"><div className="text-[10px] font-bold text-muted">LINE ITEMS</div>{draft.items.map((item, index) => <div key={`${index}-${item.description}`} className="grid grid-cols-6 gap-2"><input aria-label="Item description" className="col-span-3 h-9 rounded-md border border-line px-2 text-[11px] text-ink" value={item.description} onChange={(event) => setDraft({ ...draft, items: draft.items.map((line, lineIndex) => lineIndex === index ? { ...line, description: event.target.value } : line) })} /><input aria-label="Quantity" className="col-span-1 h-9 rounded-md border border-line px-2 text-[11px] text-ink" min="0.01" step="0.01" type="number" value={item.quantity} onChange={(event) => setDraft({ ...draft, items: draft.items.map((line, lineIndex) => lineIndex === index ? { ...line, quantity: Number(event.target.value) } : line) })} /><input aria-label="Rate" className="col-span-2 h-9 rounded-md border border-line px-2 text-[11px] text-ink" min="0" step="0.01" type="number" value={item.rate} onChange={(event) => setDraft({ ...draft, items: draft.items.map((line, lineIndex) => lineIndex === index ? { ...line, rate: Number(event.target.value) } : line) })} /></div>)}</div><div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-[10px] font-bold text-muted">TAX<input className="h-9 rounded-md border border-line px-2 text-xs text-ink" min="0" step="0.01" type="number" value={draft.tax} onChange={(event) => setDraft({ ...draft, tax: Number(event.target.value) })} /></label><label className="grid gap-1 text-[10px] font-bold text-muted">DISCOUNT<input className="h-9 rounded-md border border-line px-2 text-xs text-ink" min="0" step="0.01" type="number" value={draft.discount} onChange={(event) => setDraft({ ...draft, discount: Number(event.target.value) })} /></label></div><div className="flex justify-between border-t border-line pt-3 text-xs"><span className="font-semibold text-slate-600">Total · {draft.currency}</span><span className="font-display text-lg font-bold text-ink">{money(total, draft.currency)}</span></div>{error && <p className="text-xs text-danger" role="alert">{error}</p>}<button className={`${primaryButton} w-full`} disabled={!canCreateInvoice} onClick={approve}><Check size={14} /> Approve & create invoice</button><button className="w-full py-1 text-[10px] font-semibold text-muted" onClick={() => { setDraft(null); setError('') }}>Discard draft</button></div></Panel> : <Panel title="Invoice preview" subtitle="Review the generated details"><div className="p-5 text-xs text-muted">Your editable invoice preview appears here after generation.</div></Panel>}
      <Panel title="Review before saving"><div className="p-5"><div className="flex gap-3 rounded-lg bg-violet-50 p-3.5"><Sparkles size={16} className="mt-0.5 shrink-0 text-ai" /><p className="text-[11px] leading-relaxed text-violet-950">Check client, line items, tax, discount and due date. The invoice is saved only when you approve it.</p></div><Link to="/invoices" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-brand">Review invoices <ArrowRight size={12} /></Link></div></Panel>
    </div></div></div>
}

export function AnalyticsPage() {
  const { dashboard, isLoading, error, refreshWorkspace } = useWorkspace()
  const [range, setRange] = useState('90D')
  const [revenue, setRevenue] = useState([])
  useEffect(() => { let active = true; api.get('/dashboard', { params: { range } }).then(({ data }) => { if (active) setRevenue(data.revenue || []) }).catch(() => { if (active) setRevenue([]) }); return () => { active = false } }, [range])
  return <div><PageHeading eyebrow="Your business, in focus" title="Analytics" description="See your income and payment patterns from saved workspace records." actions={<button className={secondaryButton} onClick={() => setRange(range === '90D' ? '1Y' : '90D')}><CalendarDays size={14} /> Last {range === '90D' ? '90 days' : 'year'} <ChevronDown size={13} /></button>} /><WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Analytics will appear after you add invoices and receive payments.">{dashboard && <><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><MetricCard label="Gross revenue" value={money(dashboard.stats.totalEarnings)} note="Paid invoices" icon={BadgeDollarSign} tone="indigo" /><MetricCard label="Outstanding" value={money(dashboard.stats.pendingPayments)} note="Pending and overdue" icon={Clock3} tone="amber" /><MetricCard label="Invoices created" value={String(dashboard.stats.totalInvoices)} note="All statuses" icon={FileText} tone="violet" /></div><div className="mt-5"><RevenuePanel data={revenue} range={range} setRange={setRange} /></div></>}</WorkspaceDataState></div>
}

export function SettingsPage() {
  const { workspace, isLoading, error, refreshWorkspace, updateWorkspace } = useWorkspace()
  const [values, setValues] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => { if (workspace) setValues({ name: workspace.name || '', businessName: workspace.businessName || '', businessEmail: workspace.businessEmail || '', businessAddress: workspace.businessAddress || '', defaultCurrency: workspace.defaultCurrency || 'USD', timezone: workspace.timezone || 'UTC' }) }, [workspace])
  const submit = async (event) => { event.preventDefault(); setSaving(true); setMessage(''); try { await updateWorkspace(values); setMessage('Workspace settings saved.') } catch (requestError) { setMessage(errorMessage(requestError)) } finally { setSaving(false) } }
  if (isLoading || error || !values) return <WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Workspace settings are unavailable." />
  const set = (key, value) => setValues({ ...values, [key]: value })
  return <div className="max-w-4xl"><PageHeading eyebrow="Make it yours" title="Settings" description="Manage the business details shown on client invoices." actions={<button form="settings-form" className={primaryButton} disabled={saving}><Check size={14} /> Save changes</button>} /><form id="settings-form" onSubmit={submit} className="space-y-4"><Panel title="Business profile" subtitle="Details clients see on your invoices"><div className="grid gap-4 p-5 sm:grid-cols-2">{[['businessName', 'Business name'], ['businessEmail', 'Business email'], ['name', 'Workspace name'], ['businessAddress', 'Business address']].map(([key, label]) => <label key={key} className="grid gap-1.5 text-xs font-semibold text-slate-700">{label}<input required={key === 'businessName'} value={values[key]} onChange={(event) => set(key, event.target.value)} className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-indigo-400" /></label>)}<label className="grid gap-1.5 text-xs font-semibold text-slate-700">Default currency<select value={values.defaultCurrency} onChange={(event) => set('defaultCurrency', event.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 font-normal"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option></select></label><label className="grid gap-1.5 text-xs font-semibold text-slate-700">Timezone<input value={values.timezone} onChange={(event) => set('timezone', event.target.value)} className="h-10 rounded-lg border border-line px-3 font-normal outline-none focus:border-indigo-400" /></label></div></Panel>{message && <p className="text-xs text-muted" role="status">{message}</p>}</form></div>
}
