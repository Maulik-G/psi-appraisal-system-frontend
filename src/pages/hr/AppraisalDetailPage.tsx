import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAppraisalById, approveAppraisal } from '../../api/appraisals'
import { getGoalsByAppraisal } from '../../api/goals'
import { getFeedbackByAppraisal } from '../../api/feedback'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { StatusBadge, GoalStatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { Badge } from '../../components/ui/badge'
import { format } from 'date-fns'
import { ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { CycleProgressBar } from '../../components/CycleProgressBar'

export function HRAppraisalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const appraisalId = Number(id)
  
  const [hrComments, setHrComments] = useState('')
  const [finalRating, setFinalRating] = useState(0)

  const { data: appraisal, isLoading } = useQuery({
    queryKey: ['appraisal', appraisalId],
    queryFn: () => getAppraisalById(appraisalId, user!.id),
    enabled: !!user,
  })

  useEffect(() => {
    if (appraisal) {
      setHrComments(appraisal.hrComments || '')
      setFinalRating(appraisal.managerRating || 0)
    }
  }, [appraisal])

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', appraisalId],
    queryFn: () => getGoalsByAppraisal(appraisalId),
    enabled: !!appraisalId,
  })

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedback', appraisalId],
    queryFn: () => getFeedbackByAppraisal(appraisalId),
    enabled: !!appraisalId,
  })

  const approve = useMutation({
    mutationFn: () => approveAppraisal(appraisalId, { hrComments, finalRating }),
    onSuccess: () => { 
      toast.success('Appraisal finalized and published')
      qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] }) 
      navigate('/hr/dashboard')
    },
    onError: () => toast.error('Failed to finalize'),
  })

  if (isLoading) return <div className="p-10 text-slate-500 animate-pulse">Loading administrative view...</div>
  if (!appraisal) return <div className="p-10 text-slate-500 font-bold">Appraisal not found.</div>

  const showSelf = ['SELF_SUBMITTED','MANAGER_REVIEWED','FINALIZED'].includes(appraisal.appraisalStatus)
  const showManager = ['MANAGER_REVIEWED','FINALIZED'].includes(appraisal.appraisalStatus)
  const isPendingHR = appraisal.appraisalStatus === 'MANAGER_REVIEWED'

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full shadow-sm border-slate-200">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Calibration Center</h1>
            <p className="text-slate-500 font-medium">Administrative Review for {appraisal.employeeName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white border-none py-1.5 px-3">HR AUTHORIZED</Badge>
            <StatusBadge status={appraisal.appraisalStatus} />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-slate-50/50 backdrop-blur-sm px-8">
        <CycleProgressBar currentStatus={appraisal.appraisalStatus} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Context & Feedback */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/5">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">Employee Context</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Profile</p>
                        <p className="text-sm font-bold mt-1">{appraisal.employeeJobTitle}</p>
                        <p className="text-xs text-slate-400">{appraisal.employeeDepartment}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reporting To</p>
                        <p className="text-sm font-bold mt-1">{appraisal.managerName}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Self vs Manager Rating</p>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="text-center">
                                <p className="text-sm font-black">{appraisal.selfRating || '--'}</p>
                                <p className="text-[8px] opacity-40 uppercase font-black">Self</p>
                             </div>
                             <div className="text-center">
                                <p className="text-sm font-black text-brand-400">{appraisal.managerRating || '--'}</p>
                                <p className="text-[8px] opacity-40 uppercase font-black text-brand-400">Mgr</p>
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Peer/Stakeholder Feedback (Compact) */}
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-50"><CardTitle className="text-sm">Feedback Loop ({feedbacks.length})</CardTitle></CardHeader>
                <CardContent className="pt-4 space-y-4">
                    {feedbacks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-4">No stakeholder feedback available</p>
                    ) : feedbacks.map(f => (
                        <div key={f.id} className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-[10px] font-bold text-slate-700">{f.reviewerName}</p>
                                <RatingStars value={f.rating} readonly size={8} />
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-tight">"{f.comments}"</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Middle Column: Review Details */}
        <div className="lg:col-span-8 space-y-8">
            {/* Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {showSelf && (
                    <Card className="border-none shadow-sm border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-slate-400">Self Assessment</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Success Highlights</p>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{appraisal.whatWentWell}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Growth Needs</p>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{appraisal.whatToImprove}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {showManager && (
                    <Card className="border-none shadow-sm border-l-4 border-l-brand-600">
                        <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-slate-400">Manager Evaluation</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Key Strengths</p>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{appraisal.managerStrengths}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Action Points</p>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{appraisal.managerImprovements}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Calibration Controls */}
            {isPendingHR && (
                <Card className="border-none shadow-lg ring-2 ring-slate-900/5 overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white flex flex-row justify-between items-center py-4">
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            Final Calibration & Approval
                        </CardTitle>
                        <Badge variant="outline" className="text-slate-400 border-slate-700">AUTHORITY LEVEL 3</Badge>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6 bg-slate-50/50">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Final Performance Index</label>
                                <div className="flex items-center gap-6">
                                    <RatingStars value={finalRating} onChange={setFinalRating} size={32} />
                                    <div className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-xl">
                                        {finalRating}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4 font-medium italic">
                                    Normalizing scores helps maintain organizational parity.
                                </p>
                            </div>
                            {finalRating !== appraisal.managerRating && (
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3 max-w-xs transition-all animate-in zoom-in-95">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                                    <p className="text-xs text-amber-800 font-bold leading-tight">
                                        Score Override: You are adjusting the manager's initial score of {appraisal.managerRating}.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Calibration Memo (Official Record) *</label>
                            <Textarea 
                                value={hrComments}
                                onChange={e => setHrComments(e.target.value)}
                                placeholder="Explain the rationale for this final rating and include any cross-departmental calibration notes..."
                                rows={5}
                                className="bg-white border-slate-200 focus:ring-slate-900 rounded-2xl text-sm"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button 
                                className="bg-slate-900 text-white hover:bg-black font-bold h-12 px-12 rounded-xl shadow-xl shadow-slate-200"
                                onClick={() => approve.mutate()}
                                disabled={approve.isPending || !hrComments.trim() || finalRating === 0}
                            >
                                {approve.isPending ? 'Publishing Final Result...' : 'Finalize & Publish Appraisal'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {appraisal.appraisalStatus === 'FINALIZED' && (
                <Card className="border-none shadow-sm bg-emerald-50 border-l-4 border-l-emerald-500">
                    <CardHeader><CardTitle className="text-emerald-900">Calibration Result</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Final Published Rating</p>
                            <RatingStars value={appraisal.managerRating || 0} readonly size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">HR Narrative</p>
                            <p className="text-sm text-emerald-800 font-medium leading-relaxed italic">"{appraisal.hrComments}"</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Goals List (Read Only) */}
            <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-slate-50 pb-4"><CardTitle className="text-sm uppercase tracking-widest text-slate-400">Milestones Performance</CardTitle></CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {goals.map(g => (
                        <div key={g.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{g.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Deadline: {format(new Date(g.dueDate), 'MMM d, yyyy')}</p>
                            </div>
                            <GoalStatusBadge status={g.status} />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
