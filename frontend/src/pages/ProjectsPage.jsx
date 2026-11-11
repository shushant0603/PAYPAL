import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BriefcaseBusiness, CalendarDays, Plus } from 'lucide-react'
import { api } from '../api/client'
import { useWorkspace } from '../context/useWorkspace'
import { PageHeading, Panel, StatusBadge, WorkspaceDataState } from '../components/WorkspaceUI'
import { money } from '../utils/format'
import { primaryButton, secondaryButton } from '../utils/styles'

const errorMessage = (error) => error.response?.data?.error || 'Request failed. Please try again.'
const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const currencies = ['USD', 'EUR', 'GBP', 'CAD']
const statuses = ['Planned', 'In progress', 'On hold', 'Completed']

const emptyValues = (clientId = '', currency = 'USD') => ({
  clientId,
  name: '',
  description: '',
  budget: '',
  currency,
  status: 'Planned',
  startDate: '',
  dueDate: '',
})

export default function ProjectsPage() {
  const { projects, clients, workspace, createProject, isLoading, error, refreshWorkspace, notify } = useWorkspace()
  const [searchParams] = useSearchParams()
  const [values, setValues] = useState(() => emptyValues(searchParams.get('clientId') || '', workspace?.defaultCurrency))
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(searchParams.has('clientId'))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const closeForm = () => {
    setAdding(false)
    setEditing(null)
    setFormError('')
  }

  const edit = (project) => {
    setEditing(project)
    setAdding(true)
    setFormError('')
    setValues({
      clientId: project.clientId?.id || '',
      name: project.name,
      description: project.description || '',
      budget: String(project.budget),
      currency: project.currency || 'USD',
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : '',
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      ...values,
      budget: Number(values.budget),
      startDate: values.startDate || null,
      dueDate: values.dueDate || null,
    }
    try {
      if (editing) {
        await api.patch(`/projects/${editing.id}`, payload)
        notify(`${values.name} updated`)
        await refreshWorkspace()
      } else {
        await createProject(payload)
      }
      closeForm()
      setValues(emptyValues('', workspace?.defaultCurrency))
    } catch (requestError) {
      setFormError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (project) => {
    if (!window.confirm(`Delete "${project.name}"?`)) return
    try {
      await api.delete(`/projects/${project.id}`)
      notify('Project deleted')
      await refreshWorkspace()
    } catch (requestError) {
      notify(errorMessage(requestError))
    }
  }

  const startNew = () => {
    setEditing(null)
    setValues(emptyValues('', workspace?.defaultCurrency))
    setFormError('')
    setAdding(!adding)
  }

  return (
    <div>
      <PageHeading
        eyebrow="Client work"
        title="Projects"
        description="Track multiple projects for each client."
        actions={<button onClick={startNew} className={primaryButton}><Plus size={15} /> New project</button>}
      />
      {adding && (
        <Panel className="mb-5 p-5" title={editing ? 'Edit project' : 'Create a project'}>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
            <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
              Client
              <select required value={values.clientId} onChange={(event) => setValues({ ...values, clientId: event.target.value })} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal">
                <option value="">Select a client</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.companyName || client.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
              Project name
              <input required maxLength={160} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} className="h-10 rounded-lg border border-line px-3 text-xs font-normal" />
            </label>
            <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
              Budget
              <input required min="0" step="0.01" type="number" value={values.budget} onChange={(event) => setValues({ ...values, budget: event.target.value })} className="h-10 rounded-lg border border-line px-3 text-xs font-normal" />
            </label>
            <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
              Currency
              <select value={values.currency} onChange={(event) => setValues({ ...values, currency: event.target.value })} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal">
                {currencies.map((currency) => <option key={currency}>{currency}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
              Status
              <select value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value })} className="h-10 rounded-lg border border-line bg-white px-3 text-xs font-normal">
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
              Start date
              <input type="date" value={values.startDate} onChange={(event) => setValues({ ...values, startDate: event.target.value })} className="h-10 rounded-lg border border-line px-3 text-xs font-normal" />
            </label>
            <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
              Due date
              <input type="date" value={values.dueDate} onChange={(event) => setValues({ ...values, dueDate: event.target.value })} className="h-10 rounded-lg border border-line px-3 text-xs font-normal" />
            </label>
            <label className="grid gap-1 text-[11px] font-semibold text-slate-600 sm:col-span-2">
              Description
              <textarea maxLength={4000} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} className="min-h-20 rounded-lg border border-line px-3 py-2 text-xs font-normal" />
            </label>
            {formError && <p className="text-xs text-danger sm:col-span-2" role="alert">{formError}</p>}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" className={secondaryButton} onClick={closeForm}>Cancel</button>
              <button disabled={saving || !clients.length} className={primaryButton}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create project'}</button>
            </div>
          </form>
        </Panel>
      )}
      <WorkspaceDataState loading={isLoading} error={error} onRetry={refreshWorkspace} empty="Add a client first, then create your first project.">
        {projects.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {projects.map((project) => (
              <article key={project.id} className="rounded-xl border border-line bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-indigo-50 text-brand"><BriefcaseBusiness size={17} /></span>
                    <div>
                      <h3 className="text-sm font-bold text-ink">{project.name}</h3>
                      <Link to={`/clients/${project.clientId?.id}`} className="mt-1 block text-[11px] text-brand hover:underline">{project.clientId?.companyName || project.clientId?.name}</Link>
                    </div>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-muted">{project.description || 'No project description.'}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] text-muted">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> Due {dateLabel(project.dueDate)}</span>
                  <span className="text-xs font-bold text-ink">{money(project.budget, project.currency)}</span>
                </div>
                <div className="mt-3 flex justify-end gap-3 border-t border-slate-100 pt-3">
                  <button className="text-[10px] font-semibold text-brand hover:underline" onClick={() => edit(project)}>Edit</button>
                  <button className="text-[10px] font-semibold text-danger hover:underline" onClick={() => remove(project)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </WorkspaceDataState>
    </div>
  )
}
