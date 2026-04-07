import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAppraisalById, acknowledgeAppraisal } from '../../api/appraisals'
import { getGoalsByAppraisal, updateGoalProgress } from '../../api/goals'
import { getFeedbackByAppraisal } from '../../api/feedback'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge, GoalStatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { Badge } from '../../components/ui/badge'
import { Dialog } from '../../components/ui/dialog'
import { Select } from '../../components/ui/select'
import { format } from 'date-fns'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import type { Goal } from '../../types'

export function EmployeeAppraisalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const appraisalId = Number(id)

  const [statusGoal, setStatusGoal] = useState<Goal | null>(null)
  const [newStatus, setNewStatus] = useState('IN_PROGESS')

  const { data: appraisal, isLoading } = useQuery({
    queryKey: ['appraisal', appraisalId],
    queryFn: () => getAppraisalById(appraisalId, user!.id),
    enabled: !!user,
  })

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', appraisalId],
    queryFn: () => getGoalsByAppraisal(appraisalId),
  })

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedback', appraisalId],
    queryFn: () => getFeedbackByAppraisal(appraisalId),
  })

  const acknowledge = useMutation({
    mutationFn: () => acknowledgeAppraisal(appraisalId, user!.id),
    onSuccess: () => {
      toast.success('Appraisal acknowledged')
      qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] })
      qc.invalidateQueries({ queryKey: ['my-appraisals'] })
    },
    onError: () => toast.error('Failed to acknowledge'),
  })

  const updateStatus = useMutation({
    mutationFn: () => updateGoalProgress(statusGoal!.id, user!.id, { status: newStatus }),
    onSuccess: () => {
      toast.success('Status updated')
      setStatusGoal(null)
      qc.invalidateQueries({ queryKey: ['goals', appraisalId] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  const openStatus = (g: Goal) => { setStatusGoal(g); setNewStatus(g.status) }

  if (isLoading) return <div className="text-violet-600/70 text-sm p-6">Loading...</div>
  if (!appraisal) return <div className="text-violet-600/70 text-sm p-6">Appraisal not found.</div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div>
          <h1 className="text-2xl font-semibold text-violet-950 tracking-tight">{appraisal.cycleName}</h1>
          <p className="text-violet-700/80 text-sm">Manager: {appraisal.managerName}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-violet-700/80 uppercase tracking-wide">Cycle Period</p>
            <p className="font-medium text-violet-950">
              {format(new Date(appraisal.cycleStartDate), 'MMM d')} — {format(new Date(appraisal.cycleEndDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs text-violet-700/80 uppercase tracking-wide">Status</p>
            <div className="mt-1"><StatusBadge status={appraisal.appraisalStatus} /></div>
          </div>
          {appraisal.submittedAt && (
            <div>
              <p className="text-xs text-violet-700/80 uppercase tracking-wide">Submitted</p>
              <p className="text-sm text-slate-700">{format(new Date(appraisal.submittedAt), 'MMM d, yyyy')}</p>
            </div>
          )}
          {appraisal.approvedAt && (
            <div>
              <p className="text-xs text-violet-700/80 uppercase tracking-wide">Approved</p>
              <p className="text-sm text-slate-700">{format(new Date(appraisal.approvedAt), 'MMM d, yyyy')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {['SELF_SUBMITTED','MANAGER_REVIEWED','APPROVED','ACKNOWLEDGED'].includes(appraisal.appraisalStatus) && (
        <Card>
          <CardHeader><CardTitle>Your Self Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">What Went Well</p>
              <p className="text-slate-700 bg-violet-50/50 rounded-lg p-3 text-sm">{appraisal.whatWentWell || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">What To Improve</p>
              <p className="text-slate-700 bg-violet-50/50 rounded-lg p-3 text-sm">{appraisal.whatToImprove || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Achievements</p>
              <p className="text-slate-700 bg-violet-50/50 rounded-lg p-3 text-sm">{appraisal.achievements || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Self Rating</p>
              <RatingStars value={appraisal.selfRating || 0} readonly />
            </div>
          </CardContent>
        </Card>
      )}

      {['MANAGER_REVIEWED','APPROVED','ACKNOWLEDGED'].includes(appraisal.appraisalStatus) && (
        <Card>
          <CardHeader><CardTitle>Manager Review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Strengths</p>
              <p className="text-slate-700 bg-violet-50/50 rounded-lg p-3 text-sm">{appraisal.managerStrengths || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Areas for Improvement</p>
              <p className="text-slate-700 bg-violet-50/50 rounded-lg p-3 text-sm">{appraisal.managerImprovements || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Overall Comments</p>
              <p className="text-slate-700 bg-violet-50/50 rounded-lg p-3 text-sm">{appraisal.managerComments || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Manager Rating</p>
              <RatingStars value={appraisal.managerRating || 0} readonly />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Goals ({goals.length})</CardTitle></CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-violet-600/70 text-sm text-center py-4">No goals set yet.</p>
          ) : (
            <div className="space-y-2">
              {goals.map(g => (
                <div key={g.id} className="border border-slate-100 rounded-lg p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-violet-950">{g.title}</p>
                    {g.description && <p className="text-sm text-violet-700/80 mt-0.5">{g.description}</p>}
                    <p className="text-xs text-violet-600/70 mt-1">Due {format(new Date(g.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <GoalStatusBadge status={g.status} />
                    {g.status !== 'COMPLETED' && g.status !== 'CANCELLED' && (
                      <Button size="sm" variant="outline" onClick={() => openStatus(g)}>Update</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {feedbacks.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Feedback</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {feedbacks.map(f => (
              <div key={f.id} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-violet-950">{f.reviewerName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{f.feedbackType}</Badge>
                    <RatingStars value={f.rating} readonly />
                  </div>
                </div>
                <p className="text-sm text-slate-600">{f.comments}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {appraisal.appraisalStatus === 'APPROVED' && (
        <div className="flex justify-end">
          <Button onClick={() => acknowledge.mutate()} disabled={acknowledge.isPending} className="gap-2">
            <CheckCircle size={16} />
            {acknowledge.isPending ? 'Acknowledging...' : 'Acknowledge Appraisal'}
          </Button>
        </div>
      )}

      <Dialog open={!!statusGoal} onClose={() => setStatusGoal(null)} title={`Update Status — ${statusGoal?.title ?? ''}`}>
        <form onSubmit={e => { e.preventDefault(); updateStatus.mutate() }} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
            <Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setStatusGoal(null)}>Cancel</Button>
            <Button type="submit" disabled={updateStatus.isPending}>Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
