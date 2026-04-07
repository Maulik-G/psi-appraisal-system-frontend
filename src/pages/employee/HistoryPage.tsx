import { useQuery } from '@tanstack/react-query'
import { getEmployeeHistory } from '../../api/reports'
import { Card, CardContent } from '../../components/ui/card'
import { StatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { History } from 'lucide-react'

export function EmployeeHistoryPage() {
  const { user } = useAuth()

  const { data: history, isLoading } = useQuery({
    queryKey: ['employee-history', user?.id],
    queryFn: () => getEmployeeHistory(user!.id),
    enabled: !!user,
  })

  if (isLoading) return <div className="text-violet-600/70 text-sm p-6">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-violet-950 tracking-tight">My History</h1>
        <p className="text-sm text-violet-700/80 mt-1">Your appraisal record across all cycles</p>
      </div>

      {!history || history.cycles.length === 0 ? (
        <div className="text-center py-16 text-violet-600/70">
          <History size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">No appraisal history yet</p>
          <p className="text-xs mt-1">Completed appraisal cycles will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...history.cycles]
            .sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime())
            .map((c, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-violet-950">{c.cycleName}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-violet-700/80">
                      <span>Manager: <span className="text-slate-700">{c.managerName}</span></span>
                      <span>
                        {format(new Date(c.cycleStartDate), 'MMM d, yyyy')} — {format(new Date(c.cycleEndDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-violet-600/70 mb-1">Self</p>
                      {c.selfRating ? <RatingStars value={c.selfRating} readonly /> : <span className="text-xs text-slate-300">—</span>}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-violet-600/70 mb-1">Manager</p>
                      {c.managerRating ? <RatingStars value={c.managerRating} readonly /> : <span className="text-xs text-slate-300">—</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
