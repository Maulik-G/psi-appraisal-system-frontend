import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTeamAppraisals, getMyAppraisals } from '../../api/appraisals'
import { getTeamMembers } from '../../api/users'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { Users, ClipboardList, Clock, CheckCircle, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

export function ManagerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Team appraisals — where this manager is the reviewer
  const { data: teamAppraisals = [] } = useQuery({
    queryKey: ['team-appraisals', user?.id],
    queryFn: () => getTeamAppraisals(user!.id),
    enabled: !!user,
  })

  // Own appraisals — where this manager is the employee (only if they have a manager above them)
  const { data: myAppraisals = [] } = useQuery({
    queryKey: ['my-appraisals', user?.id],
    queryFn: () => getMyAppraisals(user!.id),
    enabled: !!user && !!user.managerId,
  })

  const { data: team = [] } = useQuery({
    queryKey: ['team', user?.id],
    queryFn: () => getTeamMembers(user!.id),
    enabled: !!user,
  })

  const active = teamAppraisals.filter(a => a.appraisalStatus !== 'ACKNOWLEDGED').length
  const awaitingReview = teamAppraisals.filter(a =>
    a.appraisalStatus === 'SELF_SUBMITTED' || a.appraisalStatus === 'MANAGER_DRAFT'
  ).length
  const completed = teamAppraisals.filter(a => a.appraisalStatus === 'ACKNOWLEDGED').length

  const getMyActionLabel = (status: string) => {
    if (status === 'PENDING' || status === 'EMPLOYEE_DRAFT') return 'Fill Self Assessment'
    if (status === 'APPROVED') return 'Acknowledge'
    return 'View'
  }

  const getMyActionPath = (id: number, status: string) => {
    if (status === 'PENDING' || status === 'EMPLOYEE_DRAFT')
      return `/manager/my-appraisals/${id}/self-assessment`
    return `/manager/my-appraisals/${id}`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-violet-950 tracking-tight">
          Welcome, {user?.fullName.split(' ')[0]}
        </h1>
        <p className="text-violet-700/80 text-sm mt-1">{user?.jobTitle}</p>
      </div>

      {/* Manager Review Guide */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CheckCircle size={120} />
        </div>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg font-medium">
            <Clock className="w-5 h-5 text-violet-400" />
            Manager Review Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center font-bold text-violet-400 border border-violet-500/30 text-xs">1</div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-violet-300">Track Progress</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Monitor team self-assessments and goal achievements in real-time.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center font-bold text-violet-400 border border-violet-500/30 text-xs">2</div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-violet-300">Evaluate</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Review employee input, assign ratings, and add detailed performance feedback.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center font-bold text-violet-400 border border-violet-500/30 text-xs">3</div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-violet-300">Submit to HR</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Finalize your review and submit it to HR for final organizational clearance.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center font-bold text-violet-400 border border-violet-500/30 text-xs">4</div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-violet-300">Sync</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Once approved, conduct the performance meeting to discuss outcomes.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Team Size', value: team.length, icon: Users, color: 'text-slate-600' },
          { label: 'Active Reviews', value: active, icon: ClipboardList, color: 'text-slate-600' },
          { label: 'Awaiting My Review', value: awaitingReview, icon: Clock, color: 'text-amber-600' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-emerald-600' },
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

      {/* My Own Appraisals — only shown if this manager reports to someone */}
      {user?.managerId && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-violet-600/70" />
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">My Appraisals</h2>
            <span className="text-xs text-violet-600/70">— as an employee reporting to your manager</span>
          </div>

          {myAppraisals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-violet-600/70 text-sm">
                No appraisals assigned to you yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {[...myAppraisals]
                .sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime())
                .map(a => (
                <Card key={a.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium text-violet-950">{a.cycleName}</p>
                        <p className="text-xs text-violet-700/80 mt-0.5">
                          Reviewed by: {a.managerName} ·{' '}
                          {format(new Date(a.cycleStartDate), 'MMM d')} — {format(new Date(a.cycleEndDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={a.appraisalStatus} />
                        <Button
                          size="sm"
                          variant={
                            a.appraisalStatus === 'PENDING' ||
                            a.appraisalStatus === 'EMPLOYEE_DRAFT' ||
                            a.appraisalStatus === 'APPROVED'
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => navigate(getMyActionPath(a.id, a.appraisalStatus))}
                        >
                          {getMyActionLabel(a.appraisalStatus)}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team Appraisals — reviews to do */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-violet-600/70" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Team Appraisals</h2>
          <span className="text-xs text-violet-600/70">— reviews you need to complete</span>
        </div>

        <Card>
          <CardContent className="pt-0">
            {teamAppraisals.length === 0 ? (
              <p className="text-center text-violet-600/70 py-8 text-sm">No appraisals found for your team.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Employee', 'Cycle', 'Status', 'Self Rating', 'My Rating', 'Actions'].map(h => (
                        <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-violet-700/80 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...teamAppraisals]
                      .sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime())
                      .map(a => (
                      <tr key={a.id} className="hover:bg-violet-50/50 transition-colors">
                        <td className="py-3 px-3 font-medium text-violet-950">{a.employeeName}</td>
                        <td className="py-3 px-3 text-slate-600 text-xs">{a.cycleName}</td>
                        <td className="py-3 px-3"><StatusBadge status={a.appraisalStatus} /></td>
                        <td className="py-3 px-3"><RatingStars value={a.selfRating || 0} readonly /></td>
                        <td className="py-3 px-3"><RatingStars value={a.managerRating || 0} readonly /></td>
                        <td className="py-3 px-3">
                          <Button
                            size="sm"
                            variant={
                              a.appraisalStatus === 'SELF_SUBMITTED' ||
                              a.appraisalStatus === 'MANAGER_DRAFT'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() => navigate(
                              a.appraisalStatus === 'SELF_SUBMITTED' || a.appraisalStatus === 'MANAGER_DRAFT'
                                ? `/manager/appraisals/${a.id}/review`
                                : `/manager/appraisals/${a.id}`
                            )}
                          >
                            {a.appraisalStatus === 'SELF_SUBMITTED'
                              ? 'Review'
                              : a.appraisalStatus === 'MANAGER_DRAFT'
                              ? 'Continue'
                              : 'View'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
