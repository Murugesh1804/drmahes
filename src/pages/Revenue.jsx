import { useState, useEffect, useRef } from 'react'
import {
  TrendingUp, TrendingDown, Banknote, AlertCircle, PieChart, Activity,
  Calendar, CreditCard, Award, BarChart3, Target, Zap, ArrowUpRight,
  ArrowDownRight, Minus, ChevronRight, Trophy
} from 'lucide-react'
import { getRevenueInsights } from '../services/api'
import { useApp } from '../context/AppContext'

// ── Helpers ────────────────────────────────────────────────
const METHOD_COLORS = {
  cash:         { bar: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: '#10b981' },
  card:         { bar: '#6366f1', bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: '#6366f1' },
  upi:          { bar: '#14b8a6', bg: 'bg-teal-100',    text: 'text-teal-700',    dot: '#14b8a6' },
  online:       { bar: '#8b5cf6', bg: 'bg-violet-100',  text: 'text-violet-700',  dot: '#8b5cf6' },
  cheque:       { bar: '#f59e0b', bg: 'bg-amber-100',   text: 'text-amber-700',   dot: '#f59e0b' },
  insurance:    { bar: '#3b82f6', bg: 'bg-blue-100',    text: 'text-blue-700',    dot: '#3b82f6' },
  unknown:      { bar: '#94a3b8', bg: 'bg-slate-100',   text: 'text-slate-600',   dot: '#94a3b8' },
}
function methodColor(m) {
  const key = (m || '').toLowerCase()
  return METHOD_COLORS[key] || METHOD_COLORS.unknown
}

// ── Metric KPI card ─────────────────────────────────────────
function MetricCard({ icon, value, label, sub, color, accent, delay = 0 }) {
  return (
    <div
      className={`card-metric ${color} animate-slide-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
          {icon}
        </div>
        {sub != null && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            typeof sub === 'number'
              ? sub > 0 ? 'bg-emerald-50 text-emerald-700' : sub < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {typeof sub === 'number'
              ? sub > 0 ? `+${sub.toFixed(1)}%` : `${sub.toFixed(1)}%`
              : sub
            }
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 mt-3 leading-none">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1.5 tracking-wide">{label}</p>
    </div>
  )
}

// ── Collection rate ring ────────────────────────────────────
function CollectionRing({ rate }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const pct = Math.min(Math.max(rate || 0, 0), 100)
  const dash = (pct / 100) * circ

  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e'
  const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : 'Needs Attention'

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          {/* Fill */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s ease-out', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800 leading-none">{pct.toFixed(0)}%</span>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5">Collected</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ background: `${color}18`, color }}>
        {label}
      </span>
    </div>
  )
}

// ── Dual-bar Monthly trend chart ────────────────────────────
function TrendChart({ trends, fmt }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const max = Math.max(...trends.map(t => Math.max(t.billed, t.revenue)), 1)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#c7d2fe' }} />
          Billed
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#6366f1' }} />
          Collected
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ paddingBottom: '28px' }}>
          {[100, 75, 50, 25, 0].map(pct => (
            <div key={pct} className="border-t border-slate-100/80 w-full" />
          ))}
        </div>

        <div className="h-56 flex items-end gap-1 sm:gap-2 relative" style={{ paddingBottom: '28px' }}>
          {trends.map((trend, i) => {
            const billedH = Math.max((trend.billed / max) * 100, 2)
            const revH    = Math.max((trend.revenue / max) * 100, 2)
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[11px] py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap z-20 pointer-events-none shadow-xl">
                  <p className="font-bold text-white mb-1">{trend.month}</p>
                  <p className="text-slate-300">Billed: <span className="text-white font-semibold">{fmt(trend.billed)}</span></p>
                  <p className="text-slate-300">Collected: <span className="text-emerald-400 font-semibold">{fmt(trend.revenue)}</span></p>
                  {trend.billed > 0 && (
                    <p className="text-slate-300 mt-0.5 pt-0.5 border-t border-white/10">
                      Rate: <span className="text-teal-400 font-semibold">{((trend.revenue / trend.billed) * 100).toFixed(0)}%</span>
                    </p>
                  )}
                  {/* Tooltip arrow */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                </div>

                {/* Dual bars */}
                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  {/* Billed bar */}
                  <div
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: visible ? `${billedH}%` : '0%',
                      background: 'linear-gradient(180deg, #c7d2fe, #a5b4fc)',
                      transition: `height 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 50}ms`,
                    }}
                  />
                  {/* Revenue bar */}
                  <div
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: visible ? `${revH}%` : '0%',
                      background: 'linear-gradient(180deg, #818cf8, #4f46e5)',
                      transition: `height 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 50 + 80}ms`,
                      boxShadow: '0 -2px 8px rgba(99,102,241,0.3)',
                    }}
                  />
                </div>

                {/* X label */}
                <span className="absolute bottom-0 text-[9px] sm:text-[10px] text-slate-400 font-medium text-center truncate w-full leading-none">
                  {trend.month.split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main Revenue Page ───────────────────────────────────────
export default function Revenue() {
  const { fmt, notify } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all') // 'month' | '30days' | 'year' | 'all' | 'custom'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const loadData = async (p = period, s = startDate, e = endDate) => {
    setLoading(true)
    try {
      let qs = ''
      if (p === 'custom' && s && e) {
        qs = `?startDate=${s}&endDate=${e}`
      } else if (p !== 'all') {
        qs = `?period=${p}`
      }
      const res = await getRevenueInsights(qs)
      setData(res)
    } catch (err) {
      notify('Failed to load revenue insights', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (period !== 'custom') {
      loadData(period)
    }
  }, [period])

  const handleCustomApply = () => {
    if (!startDate || !endDate) {
      notify('Please select both start and end dates', 'warning')
      return
    }
    loadData('custom', startDate, endDate)
  }

  if (loading && !data) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const momGrowth = data.monthOverMonthGrowth
  const collectionPct = data.collectionRate || 0
  const prevMonthLabel = data.monthlyTrends?.slice(-2, -1)[0]?.month
  const currMonthLabel = data.monthlyTrends?.slice(-1)[0]?.month

  return (
    <div className="space-y-5 animate-fade-in pb-8">

      {/* ── Page Header & Filters ────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={22} className="text-primary-500" />
            Revenue Insights
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive financial performance analytics</p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          {[
            { key: 'month', label: 'This Month' },
            { key: '30days', label: 'Last 30 Days' },
            { key: 'year', label: 'This Year' },
            { key: 'all', label: 'All Time' },
            { key: 'custom', label: 'Custom Range' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Selector Row */}
      {period === 'custom' && (
        <div className="card flex flex-wrap items-center gap-3 py-3 px-4 bg-primary-50/50 border-primary-200">
          <Calendar size={15} className="text-primary-600" />
          <span className="text-xs font-bold text-slate-700">Custom Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input py-1 text-xs w-auto bg-white"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              className="input py-1 text-xs w-auto bg-white"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
            <button
              onClick={handleCustomApply}
              disabled={loading || !startDate || !endDate}
              className="btn-primary py-1 px-3 text-xs"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* ── Row 1: 4 KPI Metric Cards ──────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard
          icon={<Banknote size={20} />}
          color="emerald"
          accent="bg-emerald-100 text-emerald-600"
          value={fmt(data.totalRevenue)}
          label="Total Collected"
          sub={collectionPct > 0 ? `${collectionPct.toFixed(0)}% rate` : null}
          delay={0}
        />
        <MetricCard
          icon={<TrendingUp size={20} />}
          color="indigo"
          accent="bg-indigo-100 text-indigo-600"
          value={fmt(data.totalBilled)}
          label="Total Billed"
          sub={data.billCount ? `${data.billCount} bills` : null}
          delay={60}
        />
        <MetricCard
          icon={<AlertCircle size={20} />}
          color="rose"
          accent="bg-rose-100 text-rose-600"
          value={fmt(data.pendingBalance)}
          label="Pending Balance"
          sub={data.totalBilled > 0 ? (100 - collectionPct) : null}
          delay={120}
        />
        <MetricCard
          icon={<Target size={20} />}
          color="teal"
          accent="bg-teal-100 text-teal-600"
          value={`${collectionPct.toFixed(1)}%`}
          label="Collection Rate"
          sub={collectionPct >= 80 ? '✓ On Track' : collectionPct >= 60 ? '~ Moderate' : '↓ Low'}
          delay={180}
        />
      </div>

      {/* ── Row 2: Secondary insight cards ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">

        {/* Month-over-Month Growth */}
        <div className="card flex items-center gap-4 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            momGrowth == null ? 'bg-slate-100' :
            momGrowth > 0 ? 'bg-emerald-100' : 'bg-rose-100'
          }`}>
            {momGrowth == null ? <Minus size={20} className="text-slate-400" /> :
             momGrowth > 0 ? <TrendingUp size={20} className="text-emerald-600" /> :
                             <TrendingDown size={20} className="text-rose-500" />}
          </div>
          <div className="min-w-0">
            <p className={`text-2xl font-bold leading-none ${
              momGrowth == null ? 'text-slate-400' :
              momGrowth > 0 ? 'text-emerald-600' : 'text-rose-500'
            }`}>
              {momGrowth == null ? '—' :
               momGrowth > 0 ? `+${momGrowth.toFixed(1)}%` : `${momGrowth.toFixed(1)}%`}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1.5">MoM Growth</p>
            {prevMonthLabel && currMonthLabel && (
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {prevMonthLabel} → {currMonthLabel}
              </p>
            )}
          </div>
        </div>

        {/* Avg Monthly Revenue */}
        <div className="card flex items-center gap-4 animate-slide-up" style={{ animationDelay: '260ms', animationFillMode: 'both' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-violet-100">
            <Zap size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{fmt(data.avgMonthlyRevenue || 0)}</p>
            <p className="text-xs font-medium text-slate-500 mt-1.5">Avg Monthly Revenue</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Over {data.monthlyTrends?.length || 0} months</p>
          </div>
        </div>

        {/* Peak Month */}
        <div className="card flex items-center gap-4 animate-slide-up" style={{ animationDelay: '320ms', animationFillMode: 'both' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-100">
            <Trophy size={20} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-800 leading-none truncate">
              {data.peakMonth?.month || '—'}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1.5">Peak Revenue Month</p>
            {data.peakMonth && (
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {fmt(data.peakMonth.revenue)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Monthly Trend Chart + Collection Ring ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Trend Chart — spans 2 cols */}
        <div className="card lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={17} className="text-primary-400" />
              Monthly Revenue Trend
            </h2>
            <span className="text-xs text-slate-400 font-medium">Billed vs Collected</span>
          </div>
          {data.monthlyTrends?.length === 0 ? (
            <div className="empty-state">No revenue data available</div>
          ) : (
            <TrendChart trends={data.monthlyTrends} fmt={fmt} />
          )}
        </div>

        {/* Collection Rate Ring */}
        <div className="card flex flex-col items-center justify-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 text-center">Collection Rate</h2>
            <p className="text-xs text-slate-400 text-center mt-0.5">Revenue collected of total billed</p>
          </div>
          <CollectionRing rate={collectionPct} />
          <div className="w-full space-y-2 pt-2 border-t border-slate-50">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Collected</span>
              <span className="font-semibold text-emerald-600">{fmt(data.totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Pending</span>
              <span className="font-semibold text-rose-500">{fmt(data.pendingBalance)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Avg Bill Value</span>
              <span className="font-semibold text-slate-700">{fmt(data.avgBillValue || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Payment Methods + Top Treatments ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Payment Methods */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={17} className="text-primary-400" />
            Revenue by Payment Method
          </h2>
          {data.paymentMethods?.length === 0 ? (
            <div className="empty-state">No payment data</div>
          ) : (
            <div className="space-y-3">
              {data.paymentMethods.map((method, i) => {
                const pct = ((method.revenue / (data.totalRevenue || 1)) * 100)
                const mc  = methodColor(method.method)
                return (
                  <div key={i} className="space-y-1.5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: mc.dot }} />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${mc.bg} ${mc.text}`}>
                          {method.method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{fmt(method.revenue)}</span>
                        <span className="text-xs text-slate-400 font-medium w-10 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: mc.bar,
                          boxShadow: `0 0 8px ${mc.dot}40`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Treatments */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Activity size={17} className="text-primary-400" />
            Top Revenue Treatments
          </h2>
          {data.topTreatments?.length === 0 ? (
            <div className="empty-state">No treatment data</div>
          ) : (
            <div className="space-y-2">
              {data.topTreatments.slice(0, 8).map((t, i) => {
                const maxTx = data.topTreatments[0]?.revenue || 1
                const pct   = (t.revenue / maxTx) * 100
                const rankStyle =
                  i === 0 ? { bg: 'bg-amber-100 text-amber-700',  icon: '🥇' } :
                  i === 1 ? { bg: 'bg-slate-200 text-slate-600',   icon: '🥈' } :
                  i === 2 ? { bg: 'bg-orange-100 text-orange-700', icon: '🥉' } :
                             { bg: 'bg-slate-100 text-slate-500',   icon: null }
                const revenuePerTx = t.count > 0 ? t.revenue / t.count : 0

                return (
                  <div key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {/* Rank badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${rankStyle.bg}`}>
                      {rankStyle.icon || `#${i + 1}`}
                    </div>

                    {/* Treatment info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-800 text-xs truncate pr-2">{t.treatment}</p>
                        <p className="font-bold text-emerald-600 text-sm flex-shrink-0">{fmt(t.revenue)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="progress-track flex-1" style={{ height: '4px' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${pct}%`,
                              background: i < 3
                                ? `linear-gradient(90deg, #6366f1, #818cf8)`
                                : `linear-gradient(90deg, #14b8a6, #2dd4bf)`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">
                          {t.count}x · {fmt(revenuePerTx)} each
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
