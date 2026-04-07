import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getMyAppraisals } from '../../api/appraisals'
import { getMyGoals } from '../../api/goals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/StatusBadge'
import { format } from 'date-fns'
import { ClipboardList, Target, Gem } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: appraisals = [] } = useQuery({
    queryKey: ['my-appraisals', user?.id],
    queryFn: () => getMyAppraisals(user!.id),
    enabled: !!user,
  })

  const { data: goals = [] } = useQuery({
    queryKey: ['my-goals', user?.id],
    queryFn: () => getMyGoals(user!.id),
    enabled: !!user,
  })


  const activeAppraisals = appraisals.filter(a => a.appraisalStatus !== 'ACKNOWLEDGED').length
  const totalGoals = goals.filter(g => g.status !== 'COMPLETED' && g.status !== 'CANCELLED').length
  const goalsInProgress = goals.filter(g => g.status === 'IN_PROGRESS').length

  const getActionLabel = (status: string) => {
    if (status === 'PENDING' || status === 'EMPLOYEE_DRAFT') return 'Continue Self Assessment'
    if (status === 'APPROVED') return 'Acknowledge'
    return 'View Details'
  }

  const getActionVariant = (status: string): 'default' | 'outline' => {
    if (status === 'PENDING' || status === 'EMPLOYEE_DRAFT' || status === 'APPROVED') return 'default'
    return 'outline'
  }

  const getActionPath = (id: number, status: string) => {
    if (status === 'PENDING' || status === 'EMPLOYEE_DRAFT') return `/employee/appraisals/${id}/self-assessment`
    return `/employee/appraisals/${id}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-950">Welcome, {user?.fullName.split(' ')[0]}</h1>
        <p className="text-violet-700/80 text-sm mt-1">{user?.jobTitle} {user?.departmentName ? `· ${user.departmentName}` : ''}</p>
      </div>

      {/* Appraisal Guide */}
      <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none shadow-lg shadow-violet-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ClipboardList size={120} />
        </div>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <ClipboardList className="w-5 h-5 text-violet-200" />
            Appraisal Process Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white border border-white/30 backdrop-blur-sm">1</div>
              <div>
                <p className="font-semibold text-sm">Self Assessment</p>
                <p className="text-xs text-violet-50/80 mt-1 leading-relaxed">Share your achievements, challenges, and growth areas for this cycle.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white border border-white/30 backdrop-blur-sm">2</div>
              <div>
                <p className="font-semibold text-sm">Manager Review</p>
                <p className="text-xs text-violet-50/80 mt-1 leading-relaxed">Your manager provides feedback and ratings based on your performance.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white border border-white/30 backdrop-blur-sm">3</div>
              <div>
                <p className="font-semibold text-sm">HR Approval</p>
                <p className="text-xs text-violet-50/80 mt-1 leading-relaxed">HR team verifies the details and provides final organizational comments.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white border border-white/30 backdrop-blur-sm">4</div>
              <div>
                <p className="font-semibold text-sm">Acknowledgment</p>
                <p className="text-xs text-violet-50/80 mt-1 leading-relaxed">Review the final outcome and acknowledge to complete the appraisal.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Appraisals', value: activeAppraisals, icon: ClipboardList, color: 'text-blue-600' },
          { label: 'Total Active Goals', value: totalGoals, icon: Gem, color: 'text-violet-600' },
          { label: 'Goals In Progress', value: goalsInProgress, icon: Target, color: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-700/80">{label}</p>
                  <p className="text-3xl font-bold text-violet-950 mt-1">{value}</p>
                </div>
                <Icon size={28} className={color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>My Appraisals</CardTitle></CardHeader>
        <CardContent>
          {appraisals.length === 0 ? (
            <p className="text-center text-violet-600/70 py-8">No appraisals yet. Your HR team will create one for you.</p>
          ) : (
            <div className="space-y-3">
              {[...appraisals]
                .sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime())
                .map(a => (
                <div key={a.id} className="border border-violet-100 rounded-lg p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-violet-950">{a.cycleName}</p>
                    <p className="text-sm text-violet-700/80 mt-0.5">
                      Manager: {a.managerName} · {format(new Date(a.cycleStartDate), 'MMM d')} — {format(new Date(a.cycleEndDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={a.appraisalStatus} />
                    <Button
                      size="sm"
                      variant={getActionVariant(a.appraisalStatus)}
                      onClick={() => navigate(getActionPath(a.id, a.appraisalStatus))}
                    >
                      {getActionLabel(a.appraisalStatus)}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
