import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, ChevronDown, FileText, LayoutDashboard, LogOut, Menu, Plus, Sparkles, Users, WalletCards, X } from 'lucide-react'
import { useWorkspace } from '../context/useWorkspace'
import { api } from '../api/client'

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Projects', path: '/projects', icon: BriefcaseBusiness },
  { label: 'Invoices', path: '/invoices', icon: FileText },
  { label: 'AI invoice', path: '/assistant', icon: Sparkles, accent: true },
]

const pageNames = {
  '/': 'Dashboard',
  '/clients': 'Clients',
  '/projects': 'Projects',
  '/invoices': 'Invoices',
  '/assistant': 'AI invoice',
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
        <WalletCards size={20} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-[15px] font-extrabold leading-tight text-ink">GlobalFreelance</div>
        <div className="mt-0.5 text-[11px] font-semibold tracking-[0.12em] text-muted">AI WORKSPACE</div>
      </div>
    </div>
  )
}

function Sidebar({ onNavigate }) {
  return (
    <>
      <div className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</div>
      <nav className="space-y-1 px-2" aria-label="Main navigation">
        {navigation.map(({ label, path, icon: Icon, accent, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `group flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition-colors duration-150 ${isActive ? 'bg-indigo-50 text-brand' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'}`}
          >
            <Icon size={17} strokeWidth={1.8} className={accent ? 'text-ai' : ''} />
            <span className="flex-1">{label}</span>
            {accent && <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-ai">NEW</span>}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default function WorkspaceShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notify, user, setUser, workspace, isLoading, authRequired, error, refreshWorkspace } = useWorkspace()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const pageTitle = pageNames[location.pathname] || (location.pathname.startsWith('/invoices/') ? 'Invoice details' : 'Workspace')

  const signOut = async () => {
    try {
      await api.post('/auth/logout')
      setUser(null)
      notify('Signed out')
      navigate('/login')
    } catch (requestError) {
      notify(requestError.response?.data?.error || 'Could not sign out. Please try again.')
    }
  }

  const closeMobile = () => setMobileOpen(false)

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center bg-canvas p-6"><div className="w-full max-w-sm animate-pulse space-y-3" aria-label="Loading workspace"><div className="h-4 w-32 rounded bg-slate-200" /><div className="h-24 rounded-xl bg-white" /><div className="h-40 rounded-xl bg-white" /></div></main>
  }
  if (authRequired) return <Navigate to="/login" replace />
  if (error) return <main className="grid min-h-screen place-items-center bg-canvas p-6"><div className="max-w-md rounded-xl border border-line bg-white p-6 text-center"><h1 className="font-display text-lg font-bold text-ink">Workspace unavailable</h1><p className="mt-2 text-sm text-muted">{error}</p><button className="mt-4 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-hover" onClick={refreshWorkspace}>Retry</button></div></main>

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/25 lg:hidden" onClick={closeMobile} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-63 flex-col border-r border-line bg-white transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <BrandMark />
          <button aria-label="Close menu" className="mr-3 grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden" onClick={closeMobile}><X size={18} /></button>
        </div>
        <Sidebar onNavigate={closeMobile} />
      </aside>

      <div className="min-h-screen lg:pl-63">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex h-17 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button aria-label="Open menu" className="grid size-9 place-items-center rounded-lg border border-line text-slate-600 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
            <div className="min-w-34">
              <div className="hidden items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:flex"><span>Workspace</span><span>/</span><span className="text-slate-500">{pageTitle}</span></div>
              <h1 className="mt-0.5 font-display text-[17px] font-bold leading-tight text-ink">{pageTitle}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button onClick={() => navigate('/assistant')} className="hidden h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-bold text-white shadow-sm transition hover:bg-brand-hover sm:flex"><Plus size={15} /> Create invoice with AI</button>
              <div className="relative">
                <button aria-expanded={profileOpen} aria-label="Open account menu" className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-slate-50" onClick={() => setProfileOpen(!profileOpen)}>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-32 truncate text-xs font-bold leading-tight text-ink">{user?.name}</span>
                    <span className="mt-0.5 block max-w-32 truncate text-[10px] text-muted">{workspace?.businessName || 'Freelancer'}</span>
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {profileOpen && <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-line bg-white p-1.5 shadow-xl"><button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-danger hover:bg-rose-50"><LogOut size={14} /> Sign out</button></div>}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-370 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
