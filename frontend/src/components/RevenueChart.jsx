import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { money } from '../utils/format'
import { Panel } from './WorkspaceUI'

export default function RevenueChart({ data = [], range = '30D', onRangeChange, currency = 'USD' }) {
  const netIncome = data.reduce((total, point) => total + point.income - point.expenses, 0)

  return (
    <Panel title="Revenue overview" subtitle="Income and expenses over time" action={<div className="flex rounded-lg bg-slate-100 p-0.5">{['7D', '30D', '90D', '1Y'].map((option) => <button key={option} className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold transition ${range === option ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`} onClick={() => onRangeChange(option)}>{option}</button>)}</div>}>
      <div className="flex flex-wrap items-center gap-4 px-5 pt-4 text-[10px] text-muted"><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-brand" /> Income</span><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-violet-300" /> Expenses</span><span className="ml-auto text-xs font-bold text-ink">{money(netIncome, currency)} <span className="ml-1 text-[10px] font-medium text-muted">net income</span></span></div>
      {data.length ? <div className="h-62 w-full px-1 pb-2 pt-4 sm:h-70 sm:px-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#635BFF" stopOpacity={0.15} /><stop offset="95%" stopColor="#635BFF" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="#EAECF0" strokeDasharray="3 4" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#98A2B3', fontSize: 10 }} dy={9} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#98A2B3', fontSize: 10 }} tickFormatter={(value) => money(value, currency)} />
            <Tooltip formatter={(value) => money(value, currency)} contentStyle={{ border: '1px solid #EAECF0', borderRadius: 10, fontSize: 11, boxShadow: '0 8px 24px rgba(16,24,40,.08)' }} />
            <Area type="monotone" dataKey="income" stroke="#635BFF" strokeWidth={2.2} fill="url(#incomeFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="expenses" stroke="#B6A8F5" strokeWidth={1.7} fill="transparent" activeDot={{ r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div> : <div className="grid h-62 place-items-center px-6 text-center text-xs text-muted">Payments will appear here once your invoices are paid.</div>}
    </Panel>
  )
}
