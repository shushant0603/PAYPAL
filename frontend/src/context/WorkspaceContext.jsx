import { useCallback, useEffect, useState } from 'react'
import { WorkspaceContext } from './workspace-context.js'
import { api, normalizeRecord, normalizeRecords } from '../api/client'

export function WorkspaceProvider({ children }) {
  const [user, setUser] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [dashboardError, setDashboardError] = useState('')
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [authRequired, setAuthRequired] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const notify = (message) => {
    setToast({ id: Date.now(), message })
    window.setTimeout(() => setToast(null), 3200)
  }

  const refreshDashboard = useCallback(async () => {
    setIsDashboardLoading(true)
    setDashboardError('')
    try {
      const { data } = await api.get('/dashboard')
      setDashboard(data)
    } catch (requestError) {
      setDashboardError(requestError.response?.data?.error || 'Could not load dashboard data.')
    } finally {
      setIsDashboardLoading(false)
    }
  }, [])

  const refreshWorkspace = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [meResult, workspaceResult, clientsResult, projectsResult, invoicesResult] = await Promise.all([
        api.get('/auth/me'),
        api.get('/workspaces/current'),
        api.get('/clients'),
        api.get('/projects'),
        api.get('/invoices'),
      ])
      setUser(normalizeRecord(meResult.data.user))
      setWorkspace(normalizeRecord(workspaceResult.data.workspace))
      setClients(normalizeRecords(clientsResult.data.clients))
      setProjects(normalizeRecords(projectsResult.data.projects))
      setInvoices(normalizeRecords(invoicesResult.data.invoices))
      setAuthRequired(false)
      setIsLoading(false)
      void refreshDashboard()
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setAuthRequired(true)
        setUser(null)
        setError('Sign in to load your workspace.')
      } else if (requestError.response?.status === 503 && /MongoDB/.test(requestError.response?.data?.error || '')) {
        setError('MongoDB is not reachable yet. Start MongoDB or check MONGODB_URI, then retry.')
      } else {
        setError(requestError.response?.data?.error || 'Could not load workspace data.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [refreshDashboard])

  useEffect(() => { refreshWorkspace() }, [refreshWorkspace])

  const createInvoice = async (invoice) => {
    const { data } = await api.post('/invoices', invoice)
    await refreshWorkspace()
    notify(`${data.invoice.invoiceNumber} created successfully`)
    return normalizeRecord(data.invoice)
  }

  const createClient = async (client) => {
    const { data } = await api.post('/clients', client)
    await refreshWorkspace()
    notify(`${data.client.name} added`)
    return normalizeRecord(data.client)
  }

  const updateClient = async (id, updates) => {
    const { data } = await api.patch(`/clients/${id}`, updates)
    await refreshWorkspace()
    notify(`${data.client.name} updated`)
    return normalizeRecord(data.client)
  }

  const createProject = async (project) => {
    const { data } = await api.post('/projects', project)
    await refreshWorkspace()
    notify(`${data.project.name} created`)
    return normalizeRecord(data.project)
  }

  const updateProject = async (id, updates) => {
    const { data } = await api.patch(`/projects/${id}`, updates)
    await refreshWorkspace()
    notify(`${data.project.name} updated`)
    return normalizeRecord(data.project)
  }

  const updateWorkspace = async (updates) => {
    const { data } = await api.patch('/workspaces/current', updates)
    setWorkspace(normalizeRecord(data.workspace))
    notify('Workspace settings saved')
    return data.workspace
  }

  const value = {
    user, setUser, workspace, dashboard, dashboardError, isDashboardLoading, clients, projects, invoices,
    isLoading, authRequired, error, refreshWorkspace, refreshDashboard, createInvoice,
    createClient, updateClient, createProject, updateProject, updateWorkspace, notify,
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-80 flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-ink shadow-lg" role="status">
          <span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-success">✓</span>
          {toast.message}
        </div>
      )}
    </WorkspaceContext.Provider>
  )
}
