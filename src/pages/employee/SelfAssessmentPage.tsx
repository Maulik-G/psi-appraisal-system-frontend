import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAppraisalById, saveSelfAssessmentDraft, submitSelfAssessment } from '../../api/appraisals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { RatingStars } from '../../components/RatingStars'
import { StatusBadge } from '../../components/StatusBadge'
import { format } from 'date-fns'
import { ArrowLeft, Save, Send, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

export function SelfAssessmentPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const appraisalId = Number(id)

  // Base path depends on role — managers use /manager/my-appraisals, employees use /employee/appraisals
  const basePath = user?.role === 'MANAGER' ? '/manager/my-appraisals' : '/employee/appraisals'

  const [form, setForm] = useState({ whatWentWell: '', whatToImprove: '', achievements: '', selfRating: 0 })

  const { data: appraisal, isLoading } = useQuery({
    queryKey: ['appraisal', appraisalId],
    queryFn: () => getAppraisalById(appraisalId, user!.id),
    enabled: !!user,
  })

  // Pre-fill form if a draft was previously saved
  useEffect(() => {
    if (appraisal) {
      setForm({
        whatWentWell: appraisal.whatWentWell || '',
        whatToImprove: appraisal.whatToImprove || '',
        achievements: appraisal.achievements || '',
        selfRating: appraisal.selfRating || 0,
      })
    }
  }, [appraisal])

  const saveDraft = useMutation({
    mutationFn: () => saveSelfAssessmentDraft(appraisalId, user!.id, form),
    onSuccess: () => {
      toast.success('Draft saved')
      qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] })
      qc.invalidateQueries({ queryKey: ['my-appraisals'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save draft'),
  })

  const submit = useMutation({
    mutationFn: () => submitSelfAssessment(appraisalId, user!.id, form),
    onSuccess: () => {
      toast.success('Self assessment submitted')
      qc.invalidateQueries({ queryKey: ['my-appraisals'] })
      qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] })
      navigate(`${basePath}/${appraisalId}`)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to submit'),
  })

  if (isLoading) return <div className="text-violet-700/80 p-6">Loading...</div>
  if (!appraisal) return <div className="text-violet-700/80 p-6">Appraisal not found.</div>

  if (appraisal.appraisalStatus === 'DRAFT') {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
          <Clock size={32} className="text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Goals Pending Approval</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Your manager needs to approve your performance goals before you can start your self-assessment.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    )
  }

  const canEdit = appraisal.appraisalStatus === 'GOALS_APPROVED'
  if (!canEdit) {
    navigate(`${basePath}/${appraisalId}`)
    return null
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div>
          <h1 className="text-2xl font-bold text-violet-950">Self Assessment</h1>
          <p className="text-violet-700/80 text-sm">{appraisal.cycleName} · Manager: {appraisal.managerName}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-violet-700/80 uppercase tracking-wide">Cycle</p>
            <p className="font-medium text-violet-950">{appraisal.cycleName}</p>
          </div>
          <div>
            <p className="text-xs text-violet-700/80 uppercase tracking-wide">Period</p>
            <p className="font-medium text-violet-950">
              {format(new Date(appraisal.cycleStartDate), 'MMM d')} — {format(new Date(appraisal.cycleEndDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs text-violet-700/80 uppercase tracking-wide">Status</p>
            <div className="mt-1"><StatusBadge status={appraisal.appraisalStatus} /></div>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-amber-600 font-medium">Self-assessment in progress</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Fill Your Self Assessment</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">What Went Well *</label>
              <Textarea
                value={form.whatWentWell}
                onChange={e => setForm(f => ({ ...f, whatWentWell: e.target.value }))}
                rows={4}
                placeholder="Describe your key contributions and successes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">What Could I Improve *</label>
              <Textarea
                value={form.whatToImprove}
                onChange={e => setForm(f => ({ ...f, whatToImprove: e.target.value }))}
                rows={4}
                placeholder="Be honest about areas where you could have done better..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key Achievements *</label>
              <Textarea
                value={form.achievements}
                onChange={e => setForm(f => ({ ...f, achievements: e.target.value }))}
                rows={4}
                placeholder="List specific achievements, metrics, projects completed..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Self Rating *</label>
              <RatingStars value={form.selfRating} onChange={v => setForm(f => ({ ...f, selfRating: v }))} />
              {form.selfRating === 0 && <p className="text-xs text-violet-600/70 mt-1">Click a star to rate yourself</p>}
            </div>

            <div className="flex gap-3 pt-2">
              {/* Save Draft — no validation required */}
              <Button
                type="button"
                variant="outline"
                onClick={() => saveDraft.mutate()}
                disabled={saveDraft.isPending}
                className="flex-1 gap-2"
              >
                <Save size={16} />
                {saveDraft.isPending ? 'Saving...' : 'Save Draft'}
              </Button>

              {/* Submit — requires all fields */}
              <Button
                type="button"
                onClick={() => submit.mutate()}
                disabled={
                  submit.isPending ||
                  form.selfRating === 0 ||
                  !form.whatWentWell.trim() ||
                  !form.whatToImprove.trim() ||
                  !form.achievements.trim()
                }
                className="flex-1 gap-2"
              >
                <Send size={16} />
                {submit.isPending ? 'Submitting...' : 'Submit to Manager'}
              </Button>
            </div>

            <p className="text-xs text-violet-600/70 text-center">
              Save Draft keeps your progress editable. Submit sends it to your manager and locks the form.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
