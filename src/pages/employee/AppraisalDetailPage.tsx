import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAppraisalById } from '../../api/appraisals'
import { getGoalsByAppraisal, updateGoalProgress } from '../../api/goals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge, GoalStatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { Badge } from '../../components/ui/badge'
import { Dialog } from '../../components/ui/dialog'
import { Select } from '../../components/ui/select'
import { format } from 'date-fns'
import { ArrowLeft, CheckCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { CycleProgressBar } from '../../components/CycleProgressBar'
import type { Goal } from '../../types'

export function EmployeeAppraisalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const appraisalId = Number(id)

  const [statusGoal, setStatusGoal] = useState<Goal | null>(null)
  const [newStatus, setNewStatus] = useState('IN_PROGRESS')

  const { data: appraisal, isLoading } = useQuery({
    queryKey: ['appraisal', appraisalId],
    queryFn: () => getAppraisalById(appraisalId, user!.id),
    enabled: !!user,
  })

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', appraisalId],
    queryFn: () => getGoalsByAppraisal(appraisalId),
  })

  // Removed unused feedbacks query

  // const acknowledge = useMutation({
  //   mutationFn: () => acknowledgeAppraisal(appraisalId, user!.id),
  //   onSuccess: () => {
  //     toast.success('Appraisal acknowledged')
  //     qc.invalidateQueries({ queryKey: ['appraisal', appraisalId] })
  //     qc.invalidateQueries({ queryKey: ['my-appraisals'] })
  //   },
  //   onError: () => toast.error('Failed to acknowledge'),
  // })

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

  if (isLoading) return <div className="text-slate-500 animate-pulse p-6">Loading appraisal details...</div>
  if (!appraisal) return <div className="text-slate-500 p-6">Appraisal not found.</div>

  const showSelf = ['SELF_SUBMITTED','MANAGER_REVIEWED','FINALIZED'].includes(appraisal.appraisalStatus)
  const showManager = ['MANAGER_REVIEWED','FINALIZED'].includes(appraisal.appraisalStatus)

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full h-10 w-10 border-slate-200">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{appraisal.cycleName}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              Reviewed by <span className="text-brand-600 underline underline-offset-4 decoration-brand-200">{appraisal.managerName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={appraisal.appraisalStatus} />
          {appraisal.appraisalStatus === 'GOALS_APPROVED' && (
            <Button 
              onClick={() => navigate(`/employee/appraisals/${appraisalId}/self-assessment`)}
              className="bg-brand-600 hover:bg-brand-700 shadow-md animate-pulse"
            >
              Start Self Assessment
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar Component */}
      <Card className="border-none shadow-sm bg-slate-50/50 backdrop-blur-sm px-8">
        <CycleProgressBar currentStatus={appraisal.appraisalStatus} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <Card className="border-none shadow-sm overflow-hidden group">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 group-hover:bg-brand-50/50 transition-colors">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Info size={16} className="text-brand-500" />
                Cycle Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Evaluation Period</p>
                <p className="text-lg font-bold text-slate-900 leading-none">
                  {format(new Date(appraisal.cycleStartDate), 'MMMM d')} — {format(new Date(appraisal.cycleEndDate), 'MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">HR Clearance</p>
                <p className="text-lg font-bold text-slate-900 leading-none">
                  {appraisal.approvedAt ? format(new Date(appraisal.approvedAt), 'MMMM d, yyyy') : '--'}
                </p>
              </div>
            </CardContent>
          </Card>

          {showSelf && (
            <Card className="border-none shadow-sm overflow-hidden">
               <CardHeader className="bg-brand-50/50 border-b border-brand-100">
                <CardTitle className="text-brand-900">Self Assessment Recap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {[
                  { label: 'Key Contributions', value: appraisal.whatWentWell },
                  { label: 'Growth Opportunities', value: appraisal.whatToImprove },
                  { label: 'Major Achievements', value: appraisal.achievements }
                ].map(section => (
                  <div key={section.label}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{section.label}</p>
                    <p className="text-slate-700 bg-slate-50 rounded-xl p-4 text-sm leading-relaxed font-medium">
                      {section.value || 'No entry found'}
                    </p>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">My Rating</p>
                  <RatingStars value={appraisal.selfRating || 0} readonly size={20} />
                </div>
              </CardContent>
            </Card>
          )}

          {showManager && (
            <Card className="border-none shadow-md overflow-hidden ring-2 ring-brand-100">
              <CardHeader className="bg-slate-900 border-b border-white/10">
                <CardTitle className="text-white flex items-center justify-between">
                  Official Manager Review
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Verified</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 bg-slate-50/30">
                {[
                  { label: 'Core Strengths', value: appraisal.managerStrengths },
                  { label: 'Action Plan for Growth', value: appraisal.managerImprovements },
                  { label: 'Executive Comments', value: appraisal.managerComments }
                ].map(section => (
                  <div key={section.label}>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{section.label}</p>
                    <p className="text-slate-800 bg-white shadow-sm border border-slate-100 rounded-xl p-4 text-sm leading-relaxed font-semibold">
                      {section.value || 'No entry found'}
                    </p>
                  </div>
                ))}
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Final Performance Index</p>
                    <RatingStars value={appraisal.managerRating || 0} readonly size={24} />
                  </div>
                  {appraisal.managerRating === 5 && (
                    <div className="text-amber-500 flex items-center gap-1 font-bold text-xs">
                      Outstanding Performance
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goals Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Milestones ({goals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-slate-400 font-medium">No performance milestones set for this cycle.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map(g => (
                    <div key={g.id} className="group border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 rounded-2xl p-5 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors uppercase text-xs tracking-wide">{g.title}</h4>
                          <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">{g.description}</p>
                          <div className="mt-4 flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               Due {format(new Date(g.dueDate), 'MMM d, yyyy')}
                            </span>
                            <GoalStatusBadge status={g.status} />
                          </div>
                        </div>
                        {g.status !== 'COMPLETED' && g.status !== 'CANCELLED' && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => openStatus(g)}
                            className="rounded-lg font-bold"
                          >
                            Track Progress
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {appraisal === null &&  ( // Calibration note logic placeholder
             <Card className="border-none shadow-sm bg-indigo-900 text-white">
                <CardHeader><CardTitle className="text-sm opacity-60 uppercase tracking-widest">HR Update</CardTitle></CardHeader>
                <CardContent><p className="text-sm font-medium italic opacity-80">"Your appraisal is currently in HR Calibration. Final scores will be released soon."</p></CardContent>
             </Card>
          )}

          {appraisal.appraisalStatus === 'FINALIZED' && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl space-y-4">
              <h3 className="text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={20} />
                Process Complete
              </h3>
              <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                Management and HR have finalized their review. Congratulations on your progress this cycle.
              </p>
              {/* Optional: Add acknowledge button if needed */}
            </div>
          )}

          <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
             <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">System Guidance</h3>
             <ul className="space-y-3">
               {[
                 'Goal Setting: Align with department KPIs',
                 'Assessment: Evidence-based responses preferred',
                 'Review: Face-to-face sync recommended'
               ].map(tip => (
                 <li key={tip} className="text-xs font-medium text-slate-400 flex items-start gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1" />
                   {tip}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>

      <Dialog open={!!statusGoal} onClose={() => setStatusGoal(null)} title="Update Progress">
        <form onSubmit={e => { e.preventDefault(); updateStatus.mutate() }} className="space-y-6">
           <div>
             <h3 className="text-sm font-bold text-slate-800 mb-2">{statusGoal?.title}</h3>
             <p className="text-xs text-slate-500 mb-6">{statusGoal?.description}</p>
           </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Status</label>
            <Select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="h-10">
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setStatusGoal(null)}>Keep Current</Button>
            <Button type="submit" disabled={updateStatus.isPending} className="px-8 shadow-md">
              {updateStatus.isPending ? 'Syncing...' : 'Update Progress'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
