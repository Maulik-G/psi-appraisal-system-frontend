import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getUsers } from '../../api/users'
import { getDepartments } from '../../api/departments'
import { approveAppraisal } from '../../api/appraisals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { StatusBadge } from '../../components/StatusBadge'
import { RatingStars } from '../../components/RatingStars'
import { Users, Clock, CheckCircle, X, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { Appraisal, AppraisalStatus } from '../../types'
import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import type { ApiResponse } from '../../types'

const ALL_STATUSES: AppraisalStatus[] = [
  'DRAFT', 'GOALS_APPROVED', 'SELF_SUBMITTED', 'MANAGER_REVIEWED', 'FINALIZED'
]

export function HRDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [appraisals, setAppraisals] = useState<Appraisal[]>([])
  const [view, setView] = useState<'LIST' | 'CALIBRATION'>('LIST')

  // Filter state
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterCycle, setFilterCycle] = useState('')

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })

  useEffect(() => {
    const fetchAppraisals = async () => {
      const employees = users.filter(u => u.role === 'EMPLOYEE' || u.role === 'MANAGER')
      if (employees.length === 0) return
      try {
        const results = await Promise.all(
          employees.map(e =>
            api.get<ApiResponse<Appraisal[]>>(`/api/appraisals/my?employeeId=${e.id}`)
              .then(r => r.data.data).catch(() => [])
          )
        )
        setAppraisals(results.flat())
      } catch (e) {
        console.error(e)
      }
    }
    fetchAppraisals()
  }, [users])

  const approve = useMutation({
    mutationFn: ({ id, rating, comments }: { id: number; rating?: number; comments?: string }) => 
      approveAppraisal(id, { hrComments: comments || 'Approved by HR', finalRating: rating }),
    onSuccess: () => {
      toast.success('Appraisal finalized and published')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['team-appraisals'] })
    },
    onError: () => toast.error('Failed to finalize'),
  })

  // Analytics logic
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0] // for ratings 1-5
    appraisals.forEach(a => {
      const r = Math.round(a.managerRating || 0)
      if (r >= 1 && r <= 5) counts[r - 1]++
    })
    return counts
  }, [appraisals])

  const maxCount = Math.max(...distribution, 1)



  const filtered = useMemo(() => {
    return appraisals
      .filter(a => {
        if (filterStatus && a.appraisalStatus !== filterStatus) return false
        if (filterDept && a.employeeDepartment !== filterDept) return false
        if (filterCycle && a.cycleName !== filterCycle) return false
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [appraisals, filterStatus, filterDept, filterCycle])

  const hasFilters = filterStatus || filterDept || filterCycle
  const clearFilters = () => { setFilterStatus(''); setFilterDept(''); setFilterCycle('') }

  const stats = {
    activeEmployees: users.filter(u => u.isActive).length,
    pendingGoals: appraisals.filter(a => a.appraisalStatus === 'DRAFT').length,
    toCalibrate: appraisals.filter(a => a.appraisalStatus === 'MANAGER_REVIEWED').length,
    finalized: appraisals.filter(a => a.appraisalStatus === 'FINALIZED').length
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">HR Administrative Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Strategic performance monitoring & calibration</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <Button 
            variant={view === 'LIST' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('LIST')}
            className="rounded-lg h-9 px-4"
          >
            Directory
          </Button>
          <Button 
            variant={view === 'CALIBRATION' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('CALIBRATION')}
            className="rounded-lg h-9 px-4"
          >
            Calibration
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Organization Size', value: stats.activeEmployees, icon: Users, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Goal Setting', value: stats.pendingGoals, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ready for Calibration', value: stats.toCalibrate, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Cycle Finalized', value: stats.finalized, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {view === 'CALIBRATION' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 border-none shadow-sm h-fit">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 size={18} className="text-brand-600" />
                  Rating Distribution (Bell Curve)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 pb-10">
                <div className="flex items-end justify-around h-64 gap-4">
                  {distribution.map((count, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full relative px-2">
                        <div 
                          className="w-full bg-brand-100 rounded-t-xl hover:bg-brand-600 transition-all duration-500 cursor-help flex flex-col justify-end"
                          style={{ height: `${(count / maxCount) * 200}px` }}
                        >
                           <span className="text-center text-[10px] font-bold text-brand-600 mb-1 group-hover:text-white transition-colors">{count}</span>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="flex justify-center mb-1">
                          <RatingStars value={i + 1} readonly />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score {i + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Calibration allows you to normalize performance scores across departments. 
                    Target distribution suggests that approximately 70% of employees should fall into Score 3-4 categories.
                  </p>
                </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60">Pending Calibration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appraisals.filter(a => a.appraisalStatus === 'MANAGER_REVIEWED').length === 0 ? (
                  <p className="text-center text-slate-500 py-10 italic">No appraisals awaiting calibration</p>
                ) : (
                  appraisals.filter(a => a.appraisalStatus === 'MANAGER_REVIEWED').map(a => (
                    <div key={a.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-white leading-none">{a.employeeName}</p>
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{a.managerRating} Rating</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{a.employeeDepartment}</p>
                      <Button 
                        className="w-full mt-4 bg-white text-slate-900 hover:bg-slate-100 font-bold" 
                        size="sm"
                        onClick={() => navigate(`/hr/appraisals/${a.id}`)}
                      >
                        Adjust & Finalize
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
           </Card>
        </div>
      ) : (
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4 flex-wrap gap-4">
            <CardTitle className="text-base font-bold">Appraisal Directory</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-36 h-9 text-xs font-semibold">
                <option value="">All Statuses</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </Select>
              {departments.length > 0 && (
                <Select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-40 h-9 text-xs font-semibold">
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </Select>
              )}
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400 hover:text-brand-600 h-9">
                  <X size={14} className="mr-1" /> Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    {['Employee', 'Manager', 'Status', 'Self', 'Manager', 'Actions'].map((h, i) => (
                      <th key={`${h}-${i}`} className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-medium">No records found</td></tr>
                  ) : filtered.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{a.employeeName}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{a.employeeDepartment}</p>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">{a.managerName}</td>
                      <td className="py-4 px-6"><StatusBadge status={a.appraisalStatus} /></td>
                      <td className="py-4 px-6"><RatingStars value={a.selfRating || 0} readonly /></td>
                      <td className="py-4 px-6"><RatingStars value={a.managerRating || 0} readonly /></td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="h-8 font-bold border-slate-200"
                             onClick={() => navigate(`/hr/appraisals/${a.id}`)}
                           >
                             Details
                           </Button>
                           {a.appraisalStatus === 'MANAGER_REVIEWED' && (
                             <Button 
                               size="sm" 
                               className="h-8 font-bold"
                               onClick={() => approve.mutate({ id: a.id })}
                             >
                               Approve
                             </Button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
