import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAppraisalById, saveManagerReviewDraft, submitManagerReview } from '../../api/appraisals'
import { getGoalsByAppraisal } from '../../api/goals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { StatusBadge, GoalStatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { format } from 'date-fns'
import { ArrowLeft, Save, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'


export function AppraisalReviewPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const appraisalId = Number(id)

  const [form, setForm] = useState({
    managerStrengths: '',
    managerImprovements: '',
    managerComments: '',
    managerRating: 0,
  })

  const { data: appraisal, isLoading } = useQuery({
    queryKey: ['appraisal', appraisalId],
    queryFn: () => getAppraisalById(appraisalId, user!.id),
    enabled: !!user,
  })

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', appraisalId],
    queryFn: () => getGoalsByAppraisal(appraisalId),
  })

  useEffect(() => {
    if (appraisal) {
      setForm({
        managerStrengths: appraisal.managerStrengths || '',
        managerImprovements: appraisal.managerImprovements || '',
        managerComments: appraisal.managerComments || '',
        managerRating: appraisal.managerRating || 0,
      })
    }
  }, [appraisal])

  const saveDraft = useMutation({
    mutationFn: () => saveManagerReviewDraft(appraisalId, user!.id, form),
    onSuccess: () => {
      toast.success('Draft saved')
      qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] })
      qc.invalidateQueries({ queryKey: ['team-appraisals'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save draft'),
  })

  const submit = useMutation({
    mutationFn: () => submitManagerReview(appraisalId, user!.id, form),
    onSuccess: () => {
      toast.success('Review submitted to HR')
      qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] })
      qc.invalidateQueries({ queryKey: ['team-appraisals'] })
      navigate('/manager/dashboard')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to submit review'),
  })

  if (isLoading) return <div className="text-slate-500 p-6">Loading...</div>
  if (!appraisal) return <div className="text-slate-500 p-6">Appraisal not found.</div>

  const canReview =
    appraisal.appraisalStatus === 'SELF_SUBMITTED' ||
    appraisal.appraisalStatus === 'MANAGER_DRAFT'
  const isDraft = appraisal.appraisalStatus === 'MANAGER_DRAFT'
  const alreadySubmitted = ['MANAGER_REVIEWED', 'APPROVED', 'ACKNOWLEDGED'].includes(
    appraisal.appraisalStatus
  )


  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {canReview ? (isDraft ? 'Continue Review' : 'Review Appraisal') : 'Appraisal Detail'}
          </h1>
          <p className="text-slate-500 text-sm">{appraisal.employeeName} · {appraisal.cycleName}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Employee</p>
            <p className="font-semibold text-slate-900">{appraisal.employeeName}</p>
            <p className="text-sm text-slate-500">
              {appraisal.employeeJobTitle}{appraisal.employeeDepartment ? ` · ${appraisal.employeeDepartment}` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Cycle</p>
            <p className="font-semibold text-slate-900">{appraisal.cycleName}</p>
            <p className="text-sm text-slate-500">
              {format(new Date(appraisal.cycleStartDate), 'MMM d, yyyy')} — {format(new Date(appraisal.cycleEndDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
            <div className="mt-1"><StatusBadge status={appraisal.appraisalStatus} /></div>
          </div>
          {isDraft && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Note</p>
              <p className="text-xs text-amber-600 font-medium mt-1">Draft saved — not yet submitted to HR</p>
            </div>
          )}
          {appraisal.submittedAt && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Employee Submitted</p>
              <p className="text-sm text-slate-700">{format(new Date(appraisal.submittedAt), 'MMM d, yyyy')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Employee Self Assessment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">What Went Well</p>
            <p className="text-slate-600 bg-slate-50 rounded p-3 text-sm">{appraisal.whatWentWell || '—'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">What To Improve</p>
            <p className="text-slate-600 bg-slate-50 rounded p-3 text-sm">{appraisal.whatToImprove || '—'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Achievements</p>
            <p className="text-slate-600 bg-slate-50 rounded p-3 text-sm">{appraisal.achievements || '—'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Self Rating</p>
            <RatingStars value={appraisal.selfRating || 0} readonly />
          </div>
        </CardContent>
      </Card>


      {goals.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Goals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {goals.map(g => (
              <div key={g.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{g.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{g.description}</p>
                    <p className="text-xs text-slate-400 mt-1">Due: {format(new Date(g.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                  <GoalStatusBadge status={g.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {canReview && (
        <Card>
          <CardHeader><CardTitle>Your Review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Strengths *</label>
              <Textarea
                value={form.managerStrengths}
                onChange={e => setForm(f => ({ ...f, managerStrengths: e.target.value }))}
                rows={3}
                placeholder="What did this employee do well?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Areas for Improvement *</label>
              <Textarea
                value={form.managerImprovements}
                onChange={e => setForm(f => ({ ...f, managerImprovements: e.target.value }))}
                rows={3}
                placeholder="What could they improve on?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Overall Comments</label>
              <Textarea
                value={form.managerComments}
                onChange={e => setForm(f => ({ ...f, managerComments: e.target.value }))}
                rows={3}
                placeholder="Any additional comments..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Manager Rating *</label>
              <RatingStars value={form.managerRating} onChange={v => setForm(f => ({ ...f, managerRating: v }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => saveDraft.mutate()}
                disabled={saveDraft.isPending}
                className="flex-1 gap-2"
              >
                <Save size={16} />{saveDraft.isPending ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                type="button"
                onClick={() => submit.mutate()}
                disabled={
                  submit.isPending ||
                  form.managerRating === 0 ||
                  !form.managerStrengths.trim() ||
                  !form.managerImprovements.trim()
                }
                className="flex-1 gap-2"
              >
                <Send size={16} />{submit.isPending ? 'Submitting...' : 'Submit to HR'}
              </Button>
            </div>
            <p className="text-xs text-slate-400 text-center">
              Save Draft keeps your review editable. Submit sends it to HR for approval.
            </p>
          </CardContent>
        </Card>
      )}

      {alreadySubmitted && (
        <Card>
          <CardHeader><CardTitle>Your Review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Strengths</p>
              <p className="text-slate-600 bg-slate-50 rounded p-3 text-sm">{appraisal.managerStrengths || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Areas for Improvement</p>
              <p className="text-slate-600 bg-slate-50 rounded p-3 text-sm">{appraisal.managerImprovements || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Overall Comments</p>
              <p className="text-slate-600 bg-slate-50 rounded p-3 text-sm">{appraisal.managerComments || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Manager Rating</p>
              <RatingStars value={appraisal.managerRating || 0} readonly />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
