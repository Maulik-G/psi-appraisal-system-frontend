import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getMyAppraisals } from '../../api/appraisals'
import { getMyGoals } from '../../api/goals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/StatusBadge'
import { format } from 'date-fns'
import { ClipboardList, Target } from 'lucide-react'
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
  const goalsInProgress = goals.filter(g => g.status === 'IN_PROGESS').length

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Active Appraisals', value: activeAppraisals, icon: ClipboardList, color: 'text-blue-600' },
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
              {appraisals.map(a => (
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
