import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCycleSummary, getDepartmentReport, getRatingDistribution, getPendingReport } from '../../api/reports'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/StatusBadge'
import { Progress } from '../../components/ui/progress'
import { BarChart3, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'

export function HRReportsPage() {
  const [cycleName, setCycleName] = useState('')
  const [submitted, setSubmitted] = useState('')

  // Get unique cycle names from all appraisals

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['report-summary', submitted],
    queryFn: () => getCycleSummary(submitted),
    enabled: !!submitted,
  })

  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['report-departments', submitted],
    queryFn: () => getDepartmentReport(submitted),
    enabled: !!submitted,
  })

  const { data: ratings, isLoading: loadingRatings } = useQuery({
    queryKey: ['report-ratings', submitted],
    queryFn: () => getRatingDistribution(submitted),
    enabled: !!submitted,
  })

  const { data: pending, isLoading: loadingPending } = useQuery({
    queryKey: ['report-pending', submitted],
    queryFn: () => getPendingReport(submitted),
    enabled: !!submitted,
  })

  const isLoading = loadingSummary || loadingDepts || loadingRatings || loadingPending

  const maxDist = ratings ? Math.max(...Object.values(ratings.distribution).map(Number), 1) : 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-violet-950 tracking-tight">Reports</h1>
        <p className="text-sm text-violet-700/80 mt-1">Cycle analytics and performance insights</p>
      </div>

      {/* Cycle selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Cycle Name</label>
              <input
                className="w-full h-9 rounded-md border border-violet-100 bg-white px-3 text-sm text-violet-950 placeholder:text-violet-600/70 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="e.g. Q1 2025"
                value={cycleName}
                onChange={e => setCycleName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && cycleName.trim() && setSubmitted(cycleName.trim())}
              />
            </div>
            <Button onClick={() => cycleName.trim() && setSubmitted(cycleName.trim())} disabled={!cycleName.trim()}>
              Generate Report
            </Button>
            {submitted && (
              <Button variant="ghost" onClick={() => { setSubmitted(''); setCycleName('') }}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!submitted && (
        <div className="text-center py-16 text-violet-600/70">
          <BarChart3 size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">Enter a cycle name to generate reports</p>
          <p className="text-xs mt-1">e.g. "Q1 2025" or "Annual Review 2025"</p>
        </div>
      )}

      {submitted && isLoading && (
        <div className="text-center py-12 text-violet-600/70 text-sm">Loading report data...</div>
      )}

      {submitted && !isLoading && summary && (
        <>
          {/* Cycle Summary */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Cycle Overview — {submitted}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Appraisals', value: summary.totalAppraisals, icon: BarChart3, color: 'text-slate-600' },
                { label: 'Completion', value: `${summary.completionPercentage}%`, icon: TrendingUp, color: 'text-emerald-600' },
                { label: 'Pending Action', value: summary.draft + summary.goalsApproved + summary.selfSubmitted + summary.managerReviewed, icon: Clock, color: 'text-amber-600' },
                { label: 'Avg Rating', value: summary.averageManagerRating ? `${summary.averageManagerRating}/5` : '—', icon: CheckCircle, color: 'text-blue-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-violet-700/80">{label}</p>
                        <p className="text-2xl font-semibold text-violet-950 mt-1 tracking-tight">{value}</p>
                      </div>
                      <Icon size={18} className={color} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <Card>
            <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Draft', value: summary.draft, color: 'bg-slate-200' },
                  { label: 'Goals Approved', value: summary.goalsApproved, color: 'bg-amber-300' },
                  { label: 'Self Submitted', value: summary.selfSubmitted, color: 'bg-blue-300' },
                  { label: 'Manager Reviewed', value: summary.managerReviewed, color: 'bg-violet-300' },
                  { label: 'Finalized', value: summary.finalized, color: 'bg-emerald-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-violet-700/80 w-36 shrink-0">{label}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${color}`}
                        style={{ width: summary.totalAppraisals > 0 ? `${(value / summary.totalAppraisals) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-6 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          {ratings && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Rating Distribution</CardTitle>
                  <span className="text-xs text-violet-700/80">{ratings.totalRated} rated · avg {ratings.averageRating ?? '—'}</span>
                </div>
              </CardHeader>
              <CardContent>
                {ratings.totalRated === 0 ? (
                  <p className="text-sm text-violet-600/70 text-center py-4">No ratings yet for this cycle</p>
                ) : (
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = Number(ratings.distribution[star] ?? 0)
                      const pct = maxDist > 0 ? (count / maxDist) * 100 : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16 shrink-0">
                            <span className="text-xs text-slate-600 font-medium">{star}</span>
                            <span className="text-slate-300 text-xs">★</span>
                          </div>
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="h-2 bg-violet-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-violet-700/80 w-6 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Department Report */}
          {departments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>By Department</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['Department', 'Employees', 'Completed', 'Pending', 'Avg Rating', 'Progress'].map(h => (
                          <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-violet-700/80 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {departments.map(d => (
                        <tr key={d.departmentName} className="hover:bg-violet-50/50 transition-colors">
                          <td className="py-3 px-3 font-medium text-violet-950">{d.departmentName}</td>
                          <td className="py-3 px-3 text-violet-700/80">{d.totalEmployees}</td>
                          <td className="py-3 px-3 text-emerald-600 font-medium">{d.completed}</td>
                          <td className="py-3 px-3 text-amber-600">{d.pending}</td>
                          <td className="py-3 px-3 text-slate-700">{d.averageRating ?? '—'}</td>
                          <td className="py-3 px-3 w-32">
                            <div className="flex items-center gap-2">
                              <Progress value={d.totalEmployees > 0 ? (d.completed / d.totalEmployees) * 100 : 0} className="h-1.5 flex-1" />
                              <span className="text-xs text-violet-600/70 w-8">
                                {d.totalEmployees > 0 ? Math.round((d.completed / d.totalEmployees) * 100) : 0}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Report */}
          {pending && pending.totalPending > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Actions</CardTitle>
                  <span className="text-xs text-violet-700/80 flex items-center gap-1">
                    <AlertCircle size={12} className="text-amber-500" />
                    {pending.totalPending} not yet approved
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['Employee', 'Department', 'Manager', 'Current Status'].map(h => (
                          <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-violet-700/80 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pending.entries.map(e => (
                        <tr key={e.employeeId} className="hover:bg-violet-50/50 transition-colors">
                          <td className="py-3 px-3 font-medium text-violet-950">{e.employeeName}</td>
                          <td className="py-3 px-3 text-violet-700/80">{e.departmentName ?? '—'}</td>
                          <td className="py-3 px-3 text-violet-700/80">{e.managerName}</td>
                          <td className="py-3 px-3"><StatusBadge status={e.currentStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
