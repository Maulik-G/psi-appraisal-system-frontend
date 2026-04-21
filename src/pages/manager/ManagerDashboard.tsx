import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getTeamAppraisals, getMyAppraisals, approveGoals } from '../../api/appraisals'
import { getTeamMembers } from '../../api/users'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { Users, ClipboardList, Clock, CheckCircle, User, Filter, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
// import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

export function ManagerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING_GOAL' | 'PENDING_REVIEW' | 'COMPLETED'>('ALL')

  // Team appraisals
  const { data: teamAppraisals = [] } = useQuery({
    queryKey: ['team-appraisals', user?.id],
    queryFn: () => getTeamAppraisals(user!.id),
    enabled: !!user,
  })

  // Own appraisals
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

  const approveGoalsMutation = useMutation({
    mutationFn: (id: number) => approveGoals(id, user!.id),
    onSuccess: () => {
      toast.success('Goals approved successfully')
      queryClient.invalidateQueries({ queryKey: ['team-appraisals'] })
    },
    onError: () => toast.error('Failed to approve goals'),
  })

  const stats = useMemo(() => {
    const pendingGoal = teamAppraisals.filter(a => a.appraisalStatus === 'DRAFT').length
    const pendingReview = teamAppraisals.filter(a => a.appraisalStatus === 'SELF_SUBMITTED').length
    const completed = teamAppraisals.filter(a => a.appraisalStatus === 'FINALIZED').length
    return { pendingGoal, pendingReview, completed }
  }, [teamAppraisals])

  const filteredAppraisals = useMemo(() => {
    return teamAppraisals.filter(a => {
      if (activeFilter === 'ALL') return true
      if (activeFilter === 'PENDING_GOAL') return a.appraisalStatus === 'DRAFT'
      if (activeFilter === 'PENDING_REVIEW') return a.appraisalStatus === 'SELF_SUBMITTED'
      if (activeFilter === 'COMPLETED') return a.appraisalStatus === 'FINALIZED'
      return true
    })
  }, [teamAppraisals, activeFilter])

  const getMyActionLabel = (status: string) => {
    if (status === 'DRAFT') return 'Set Goals'
    if (status === 'GOALS_APPROVED') return 'Fill Self Assessment'
    if (status === 'FINALIZED') return 'View Report'
    return 'View'
  }

  const getMyActionPath = (id: number, status: string) => {
    if (status === 'GOALS_APPROVED') return `/manager/my-appraisals/${id}/self-assessment`
    return `/manager/my-appraisals/${id}`
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Manager Dashboard
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Leading {team.length} direct reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm border-slate-200">
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Team', value: team.length, icon: Users, variant: 'slate' },
          { label: 'Action Required', value: stats.pendingGoal + stats.pendingReview, icon: AlertCircle, variant: 'amber' },
          { label: 'Pending Reviews', value: stats.pendingReview, icon: Clock, variant: 'indigo' },
          { label: 'Cycle Completed', value: stats.completed, icon: CheckCircle, variant: 'emerald' },
        ].map(({ label, value, icon: Icon, variant }) => (
          <Card key={label} className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${variant === 'amber' ? 'bg-amber-50 text-amber-600' :
                  variant === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                    variant === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-50 text-slate-600'
                  }`}>
                  <Icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <Filter size={16} className="text-slate-400 mr-2 flex-shrink-0" />
        {[
          { id: 'ALL', label: 'All Reviews' },
          { id: 'PENDING_GOAL', label: 'Goal Approvals' },
          { id: 'PENDING_REVIEW', label: 'Pending Reviews' },
          { id: 'COMPLETED', label: 'Completed' },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeFilter === filter.id
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-brand-600'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Team Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-brand-600" />
              Team Appraisals
            </h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              Showing {filteredAppraisals.length} members
            </span>
          </div>

          {filteredAppraisals.length === 0 ? (
            <Card className="bg-slate-50/50 border-dashed border-2">
              <CardContent className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium tracking-tight">No active appraisals match this filter</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAppraisals.map(a => (
                <Card key={a.id} className="group hover:border-brand-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-stretch">
                      {/* Left: Info */}
                      <div className="flex-1 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <StatusBadge status={a.appraisalStatus} />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.cycleName}</p>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 leading-none">{a.employeeName}</h3>
                        <p className="text-sm text-slate-500 mt-2 font-medium">{a.employeeJobTitle || 'Team Member'}</p>

                        <div className="mt-6 flex items-center gap-8">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Self Rating</p>
                            <RatingStars value={a.selfRating || 0} readonly className="mt-1" />
                          </div>
                          {a.managerRating > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Rating</p>
                              <RatingStars value={a.managerRating} readonly className="mt-1" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-100 p-6 flex flex-col justify-center items-center gap-3 w-full sm:w-48 group-hover:bg-brand-50 transition-colors">
                        {a.appraisalStatus === 'DRAFT' ? (
                          <Button
                            className="w-full bg-amber-600 hover:bg-amber-700"
                            onClick={() => approveGoalsMutation.mutate(a.id)}
                            disabled={approveGoalsMutation.isPending}
                          >
                            Finalize Targets
                          </Button>
                        ) : a.appraisalStatus === 'SELF_SUBMITTED' ? (
                          <Button className="w-full" onClick={() => navigate(`/manager/appraisals/${a.id}/review`)}>
                            Review Performance
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full bg-white" onClick={() => navigate(`/manager/appraisals/${a.id}`)}>
                            View Details
                          </Button>
                        )}
                        <button
                          onClick={() => navigate(`/manager/appraisals/${a.id}`)}
                          className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-brand-600 transition-colors"
                        >
                          View History <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Own Tracker */}
        <div className="space-y-6">
          {user?.managerId && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-slate-400" />
                My Own Progress
              </h2>
              {myAppraisals.length === 0 ? (
                <Card className="bg-slate-100/50 border-none">
                  <CardContent className="py-10 text-center text-slate-400 font-medium italic">
                    No cycle active for you
                  </CardContent>
                </Card>
              ) : (
                myAppraisals.map(a => (
                  <Card key={a.id} className="border-none shadow-sm bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          Active Cycle
                        </div>
                        <StatusBadge status={a.appraisalStatus} />
                      </div>
                      <h3 className="text-xl font-bold">{a.cycleName}</h3>
                      <p className="text-sm opacity-80 mt-1">Reviewer: {a.managerName}</p>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full mt-6 font-bold"
                        onClick={() => navigate(getMyActionPath(a.id, a.appraisalStatus))}
                      >
                        {getMyActionLabel(a.appraisalStatus)}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Quick Guide */}
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60">Manager Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium leading-relaxed italic opacity-80">
                "Ensure common goals are aligned with department KPIs before approving. Consistent feedback leads to 15% higher engagement."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
