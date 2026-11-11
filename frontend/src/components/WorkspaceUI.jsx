import { ArrowDownRight, ArrowUpRight, CircleHelp, MoreHorizontal } from 'lucide-react'

const statusStyles = {
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  Overdue: 'bg-rose-50 text-rose-700 ring-rose-600/10',
  Draft: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  'In progress': 'bg-indigo-50 text-indigo-700 ring-indigo-600/10',
  'At risk': 'bg-amber-50 text-amber-700 ring-amber-600/10',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
}

export function StatusBadge({ status }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusStyles[status] || statusStyles.Draft}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>
}

export function PageHeading({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>}
        <h2 className="font-display text-[22px] font-bold tracking-[-0.03em] text-ink sm:text-[25px]">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function MetricCard({ label, value, change, note, icon: Icon, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-brand',
    emerald: 'bg-emerald-50 text-success',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-ai',
  }
  return (
    <article className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-[12px] font-medium text-muted">{label}</p><p className="mt-2 font-display text-[25px] font-bold tracking-[-0.04em] text-ink sm:text-[28px]">{value}</p></div>
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tones[tone]}`}><Icon size={17} strokeWidth={1.9} /></span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
        {change && <span className={`inline-flex items-center gap-0.5 font-bold ${change.startsWith('-') ? 'text-rose-600' : 'text-success'}`}>{change.startsWith('-') ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{change.replace('-', '')}</span>}
        <span className="text-muted">{note}</span>
      </div>
    </article>
  )
}

export function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)] ${className}`}>
      {(title || action) && <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5"><div>{title && <h3 className="text-[13px] font-bold text-ink">{title}</h3>}{subtitle && <p className="mt-1 text-[11px] text-muted">{subtitle}</p>}</div>{action}</div>}
      {children}
    </section>
  )
}

export function Avatar({ initials, tone = 'bg-indigo-50 text-brand', size = 'size-9' }) {
  return <span className={`grid shrink-0 place-items-center rounded-full text-[11px] font-bold ${size} ${tone}`}>{initials}</span>
}

export function TableMenuButton({ onClick }) {
  return <button aria-label="More actions" className="grid size-8 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-ink" onClick={onClick}><MoreHorizontal size={17} /></button>
}

export function WorkspaceDataState({ loading, error, onRetry, empty, children }) {
  if (loading) return <div className="animate-pulse space-y-3" aria-label="Loading data"><div className="h-12 rounded-lg bg-white" /><div className="h-48 rounded-xl bg-white" /></div>
  if (error) return <div className="rounded-xl border border-rose-200 bg-white px-5 py-10 text-center"><p className="text-sm font-bold text-ink">Could not load this data</p><p className="mx-auto mt-1 max-w-md text-xs text-muted">{error}</p>{onRetry && <button className="mt-4 rounded-lg border border-line px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={onRetry}>Try again</button>}</div>
  if (empty && !children) return <div className="rounded-xl border border-line bg-white px-5 py-12 text-center"><span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-50 text-slate-400"><CircleHelp size={20} /></span><p className="mt-3 text-sm font-bold text-ink">Nothing here yet</p><p className="mx-auto mt-1 max-w-sm text-xs text-muted">{empty}</p></div>
  return children
}
