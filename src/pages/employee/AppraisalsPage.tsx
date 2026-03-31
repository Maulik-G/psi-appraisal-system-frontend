import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getMyAppraisals } from '../../api/appraisals'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/StatusBadge'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'

export function AppraisalsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: appraisals = [], isLoading } = useQuery({
    queryKey: ['my-appraisals', user?.id],
    queryFn: () => getMyAppraisals(user!.id),
    enabled: !!user,
  })

  const getActionLabel = (status: string) => {
    if (status === 'PENDING' || status === 'EMPLOYEE_DRAFT') return 'Continue Self Assessment'
    if (status === 'APPROVED') return 'Acknowledge'
    return 'View Details'
  }

  const getActionPath = (id: number, status: string) => {
    if (status === 'PENDING' || status === 'EMPLOYEE_DRAFT') return `/employee/appraisals/${id}/self-assessment`
    return `/employee/appraisals/${id}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Appraisals</h1>
        <p className="text-slate-500 text-sm mt-1">All your performance appraisal cycles</p>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Loading...</p>
      ) : appraisals.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No appraisals yet</p>
          <p className="text-sm mt-1">Your HR team will create an appraisal for you.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appraisals.map(a => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-lg">{a.cycleName}</h3>
                      <StatusBadge status={a.appraisalStatus} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-500">
                      <span>Manager: <span className="text-slate-700">{a.managerName}</span></span>
                      <span>Department: <span className="text-slate-700">{a.employeeDepartment || '—'}</span></span>
                      <span>Start: <span className="text-slate-700">{format(new Date(a.cycleStartDate), 'MMM d, yyyy')}</span></span>
                      <span>End: <span className="text-slate-700">{format(new Date(a.cycleEndDate), 'MMM d, yyyy')}</span></span>
                    </div>
                  </div>
                  <Button
                    variant={a.appraisalStatus === 'PENDING' || a.appraisalStatus === 'EMPLOYEE_DRAFT' || a.appraisalStatus === 'APPROVED' ? 'default' : 'outline'}
                    onClick={() => navigate(getActionPath(a.id, a.appraisalStatus))}
                  >
                    {getActionLabel(a.appraisalStatus)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
