import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeamReport } from '../../api/reports'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { BarChart3, Users, Star, Target } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'


export function TeamReportPage() {
  const { user } = useAuth()
  const [cycleName, setCycleName] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data: report, isLoading } = useQuery({
    queryKey: ['team-report', user?.id, submitted],
    queryFn: () => getTeamReport(user!.id, submitted),
    enabled: !!submitted && !!user,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Team Report</h1>
        <p className="text-sm text-zinc-500 mt-1">Performance overview for your team</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Cycle Name</label>
              <input
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                placeholder="e.g. Q1 2025"
                value={cycleName}
                onChange={e => setCycleName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && cycleName.trim() && setSubmitted(cycleName.trim())}
              />
            </div>
            <Button onClick={() => cycleName.trim() && setSubmitted(cycleName.trim())} disabled={!cycleName.trim()}>
              Generate
            </Button>
            {submitted && (
              <Button variant="ghost" onClick={() => { setSubmitted(''); setCycleName('') }}>Clear</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!submitted && (
        <div className="text-center py-16 text-zinc-400">
          <BarChart3 size={32} className="mx-auto mb-3 text-zinc-300" />
          <p className="text-sm font-medium">Enter a cycle name to view your team report</p>
        </div>
      )}

      {submitted && isLoading && (
        <div className="text-center py-12 text-zinc-400 text-sm">Loading...</div>
      )}

      {submitted && !isLoading && report && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Team Members', value: report.totalTeamMembers, icon: Users, color: 'text-zinc-600' },
              { label: 'Avg Rating', value: report.teamAverageRating ? `${report.teamAverageRating}/5` : '—', icon: Star, color: 'text-amber-500' },
              { label: 'Cycle', value: report.cycleName, icon: BarChart3, color: 'text-blue-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">{label}</p>
                      <p className="text-xl font-semibold text-zinc-900 mt-1 tracking-tight">{value}</p>
                    </div>
                    <Icon size={18} className={color} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
            <CardContent>
              {report.members.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-6">No appraisals found for this cycle</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        {['Employee', 'Job Title', 'Status', 'Self Rating', 'My Rating', 'Goals'].map(h => (
                          <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {report.members.map(m => (
                        <tr key={m.employeeId} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-3 font-medium text-zinc-900">{m.employeeName}</td>
                          <td className="py-3 px-3 text-zinc-500">{m.jobTitle || '—'}</td>
                          <td className="py-3 px-3"><StatusBadge status={m.status} /></td>
                          <td className="py-3 px-3">
                            {m.selfRating ? <RatingStars value={m.selfRating} readonly /> : <span className="text-zinc-300 text-xs">—</span>}
                          </td>
                          <td className="py-3 px-3">
                            {m.managerRating ? <RatingStars value={m.managerRating} readonly /> : <span className="text-zinc-300 text-xs">—</span>}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <Target size={13} className="text-zinc-400" />
                              <span className="text-zinc-600 text-xs">{m.goalsCompleted}/{m.totalGoals}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
