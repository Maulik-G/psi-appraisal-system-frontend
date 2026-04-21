import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAppraisalById, saveManagerReviewDraft, submitManagerReview, approveGoals } from '../../api/appraisals'
import { getGoalsByAppraisal } from '../../api/goals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { StatusBadge, GoalStatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { format } from 'date-fns'
import { ArrowLeft, Save, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { CycleProgressBar } from '../../components/CycleProgressBar'

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

  const approveGoalList = useMutation({
    mutationFn: () => approveGoals(appraisalId, user!.id),
    onSuccess: () => {
      toast.success('Goals approved. Employee can now start self-assessment.')
      qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] })
      qc.invalidateQueries({ queryKey: ['team-appraisals'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to approve goals'),
  })

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
      toast.success('Review submitted to HR for calibration')
      qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] })
      qc.invalidateQueries({ queryKey: ['team-appraisals'] })
      navigate('/manager/dashboard')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to submit review'),
  })

  if (isLoading) return <div className="p-10 text-slate-500 animate-pulse">Loading appraisal...</div>
  if (!appraisal) return <div className="p-10 text-slate-500 font-bold">Appraisal not found.</div>

  const isInGoalPhase = appraisal.appraisalStatus === 'DRAFT'
  const isReadyForReview = appraisal.appraisalStatus === 'SELF_SUBMITTED'
  const alreadySubmitted = ['MANAGER_REVIEWED', 'FINALIZED'].includes(appraisal.appraisalStatus)

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full shadow-sm">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{appraisal.employeeName}</h1>
            <p className="text-slate-500 font-medium">{appraisal.employeeJobTitle} · {appraisal.cycleName}</p>
          </div>
        </div>
        <StatusBadge status={appraisal.appraisalStatus} />
      </div>

      <Card className="border-none shadow-sm bg-slate-50/50 backdrop-blur-sm px-8">
        <CycleProgressBar currentStatus={appraisal.appraisalStatus} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {isInGoalPhase && (
             <Card className="border-none shadow-md bg-brand-900 text-white overflow-hidden">
                <div className="p-6 flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <CheckCircle2 size={24} className="text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Approve Goals</h3>
                    <p className="text-white/60 text-sm mt-1 mb-6">
                      Review the milestones set for this cycle. Once approved, they will be locked and the employee can proceed.
                    </p>
                    <Button 
                      className="bg-white text-brand-900 hover:bg-brand-50 font-bold px-8 shadow-lg shadow-black/20"
                      onClick={() => approveGoalList.mutate()}
                      disabled={approveGoalList.isPending || goals.length === 0}
                    >
                      {approveGoalList.isPending ? 'Processing...' : 'Approve & Lock Goals'}
                    </Button>
                  </div>
                </div>
             </Card>
          )}

          {/* Employee Self Assessment */}
          {(isReadyForReview || alreadySubmitted) && (
            <Card className="border-none shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-slate-900">Employee Self Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 font-medium">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">What Went Well</p>
                  <p className="text-slate-700 bg-slate-50 rounded-xl p-4 text-sm leading-relaxed">{appraisal.whatWentWell || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">What To Improve</p>
                  <p className="text-slate-700 bg-slate-50 rounded-xl p-4 text-sm leading-relaxed">{appraisal.whatToImprove || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Achievements</p>
                  <p className="text-slate-700 bg-slate-50 rounded-xl p-4 text-sm leading-relaxed">{appraisal.achievements || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Self Rating</p>
                  <RatingStars value={appraisal.selfRating || 0} readonly size={20} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manager Review Form */}
          {isReadyForReview && (
            <Card className="border-none shadow-md ring-2 ring-brand-100 overflow-hidden">
               <CardHeader className="bg-brand-600 text-white">
                <CardTitle>Manager Evaluation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Strengths *</label>
                  <Textarea
                    value={form.managerStrengths}
                    onChange={e => setForm(f => ({ ...f, managerStrengths: e.target.value }))}
                    rows={4}
                    className="border-slate-200 focus:ring-brand-500 rounded-xl"
                    placeholder="Identify key strengths demonstrated during this period..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Areas for Improvement *</label>
                  <Textarea
                    value={form.managerImprovements}
                    onChange={e => setForm(f => ({ ...f, managerImprovements: e.target.value }))}
                    rows={4}
                    className="border-slate-200 focus:ring-brand-500 rounded-xl"
                    placeholder="Actionable feedback for professional development..."
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Overall Performance Rating *</label>
                   <RatingStars value={form.managerRating} onChange={v => setForm(f => ({ ...f, managerRating: v }))} size={28} />
                </div>
                <div className="flex gap-4 pt-6">
                  <Button variant="outline" onClick={() => saveDraft.mutate()} className="flex-1 font-bold rounded-xl h-11">
                    <Save className="mr-2" size={18} /> {saveDraft.isPending ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button 
                    onClick={() => submit.mutate()} 
                    disabled={submit.isPending || !form.managerStrengths || !form.managerImprovements || form.managerRating === 0}
                    className="flex-1 font-bold rounded-xl h-11 shadow-lg shadow-brand-200"
                  >
                    <Send className="mr-2" size={18} /> {submit.isPending ? 'Syncing...' : 'Submit Review'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {alreadySubmitted && (
             <Card className="border-none shadow-sm">
                <CardHeader><CardTitle>Review Summary</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Strengths</p>
                            <p className="text-sm font-medium text-slate-700">{appraisal.managerStrengths}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Growth Areas</p>
                            <p className="text-sm font-medium text-slate-700">{appraisal.managerImprovements}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Manager Rating</p>
                        <RatingStars value={appraisal.managerRating || 0} readonly size={24} />
                    </div>
                </CardContent>
             </Card>
          )}

          {/* Goals Card */}
          <Card className="border-none shadow-sm h-fit">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-sm">Milestones ({goals.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {goals.map(g => (
                <div key={g.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-900 text-xs">{g.title}</p>
                    <GoalStatusBadge status={g.status} />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{g.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-slate-900 text-white">
                <CardHeader><CardTitle className="text-xs font-bold uppercase tracking-widest opacity-40">System context</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-brand-400 shrink-0" size={16} />
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            {isInGoalPhase ? 'Performance goals must be approved before assessment can begin.' : 
                             isReadyForReview ? 'Ensure evaluation is objective and supported by evidence.' :
                             'Calibration phase: HR will normalize scores organization-wide.'}
                        </p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Last Updated</p>
                        <p className="text-xs font-medium text-white/60">{format(new Date(appraisal.createdAt), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
