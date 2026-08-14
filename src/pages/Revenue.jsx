import { useState, useEffect } from 'react'
import { TrendingUp, Banknote, AlertCircle, PieChart, Activity, Calendar } from 'lucide-react'
import { getRevenueInsights } from '../services/api'
import { useApp } from '../context/AppContext'

function StatCard({ icon, value, label, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export default function Revenue() {
  const { fmt, notify } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await getRevenueInsights()
        setData(res)
      } catch (e) {
        notify('Failed to load revenue insights', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [notify])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-24 skeleton rounded-xl" />
          ))}
        </div>
        <div className="card h-64 skeleton rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card h-64 skeleton rounded-xl" />
          <div className="card h-64 skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  // Calculate max revenue for trend chart scaling
  const maxMonthlyRevenue = Math.max(...data.monthlyTrends.map(t => t.revenue), 1)

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Revenue Insights</h1>
          <p className="text-slate-500">Comprehensive overview of financial performance</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Banknote size={24} />}
          color="bg-emerald-50 text-emerald-600"
          value={fmt(data.totalRevenue)}
          label="Total Collected Revenue"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          color="bg-indigo-50 text-indigo-600"
          value={fmt(data.totalBilled)}
          label="Total Sales (Billed)"
        />
        <StatCard
          icon={<AlertCircle size={24} />}
          color="bg-rose-50 text-rose-600"
          value={fmt(data.pendingBalance)}
          label="Total Pending Balance"
        />
      </div>

      {/* Monthly Trend */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          Monthly Trend
        </h2>
        
        {data.monthlyTrends.length === 0 ? (
          <div className="empty-state">No revenue data available</div>
        ) : (
          <div className="h-64 flex items-end gap-2 sm:gap-4 pt-4 border-b border-slate-100 relative">
            {/* Y-Axis lines could go here */}
            {data.monthlyTrends.map((trend, i) => {
              const heightPct = Math.max((trend.revenue / maxMonthlyRevenue) * 100, 2)
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    <p className="font-semibold">{trend.month}</p>
                    <p>Collected: {fmt(trend.revenue)}</p>
                    <p className="text-slate-300">Billed: {fmt(trend.billed)}</p>
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[40px] bg-indigo-500 rounded-t-sm transition-all duration-500 hover:bg-indigo-400 relative"
                    style={{ height: `${heightPct}%` }}
                  >
                  </div>
                  
                  {/* X-Axis Label */}
                  <span className="text-[10px] sm:text-xs text-slate-500 mt-2 font-medium truncate w-full text-center">
                    {trend.month.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Methods */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PieChart size={18} className="text-slate-400" />
            Revenue by Payment Method
          </h2>
          
          {data.paymentMethods.length === 0 ? (
            <div className="empty-state">No payment data</div>
          ) : (
            <div className="space-y-4">
              {data.paymentMethods.map((method, i) => {
                const pct = ((method.revenue / data.totalRevenue) * 100) || 0
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700 capitalize">{method.method}</span>
                      <span className="font-semibold text-slate-800">{fmt(method.revenue)} <span className="text-slate-400 font-normal text-xs ml-1">({pct.toFixed(1)}%)</span></span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Treatments */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity size={18} className="text-slate-400" />
            Top Treatments
          </h2>
          
          {data.topTreatments.length === 0 ? (
            <div className="empty-state">No treatment data</div>
          ) : (
            <div className="space-y-3">
              {data.topTreatments.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{t.treatment}</p>
                      <p className="text-xs text-slate-500">{t.count} performed</p>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600">
                    {fmt(t.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
