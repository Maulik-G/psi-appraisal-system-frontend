import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getUsers } from '../../api/users'
import { getDepartments } from '../../api/departments'
import { approveAppraisal } from '../../api/appraisals'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/StatusBadge'
import { Badge } from '../../components/ui/badge'
import { format } from 'date-fns'
import { Search, ChevronDown, ChevronRight, CheckCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { Appraisal, AppraisalStatus, ApiResponse } from '../../types'
import api from '../../api/axios'

const STATUS_OPTIONS: { value: AppraisalStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'EMPLOYEE_DRAFT', label: 'Employee Draft' },
  { value: 'SELF_SUBMITTED', label: 'Self Submitted' },
  { value: 'MANAGER_DRAFT', label: 'Manager Draft' },
  { value: 'MANAGER_REVIEWED', label: 'Manager Reviewed' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
]

export function ManageAppraisalsPage() {
  const navigate = useNavigate()
  const [allAppraisals, setAllAppraisals] = useState<Appraisal[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppraisalStatus | 'ALL'>('ALL')
  const [deptFilter, setDeptFilter] = useState('')
  const [cycleFilter, setCycleFilter] = useState('')
  const [expandedCycles, setExpandedCycles] = useState<Set<string>>(new Set())

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })

  useEffect(() => {
    const employees = users.filter(u => u.role === 'EMPLOYEE')
    if (employees.length === 0) return
    setLoading(true)
    Promise.all(
      employees.map(e =>
        api.get<ApiResponse<Appraisal[]>>(`/api/appraisals/my?employeeId=${e.id}`)
          .then(r => r.data.data)
          .catch(() => [] as Appraisal[])
      )
    ).then(results => {
      const flat = results.flat()
      setAllAppraisals(flat)
      // Auto-expand all cycles on first load
      const cycles = new Set(flat.map(a => a.cycleName))
      setExpandedCycles(cycles)
    }).finally(() => setLoading(false))
  }, [users])

  const approve = useMutation({
    mutationFn: (id: number) => approveAppraisal(id, { hrComments: '' }),
    onSuccess: (updated) => {
      toast.success('Appraisal approved')
      setAllAppraisals(prev => prev.map(a => a.id === updated.id ? updated : a))
    },
    onError: () => toast.error('Failed to approve'),
  })

  // Unique cycle names for filter dropdown
  const cycleNames = useMemo(() =>
    [...new Set(allAppraisals.map(a => a.cycleName))].sort(),
    [allAppraisals]
  )

  // Filter appraisals
  const filtered = useMemo(() => {
    return allAppraisals.filter(a => {
      const matchesSearch = search === '' ||
        a.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        a.managerName.toLowerCase().includes(search.toLowerCase()) ||
        a.cycleName.toLowerCase().includes(search.toLowerCase()) ||
        (a.employeeDepartment ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || a.appraisalStatus === statusFilter
      const matchesDept = deptFilter === '' || a.employeeDepartment === deptFilter
      const matchesCycle = cycleFilter === '' || a.cycleName === cycleFilter
      return matchesSearch && matchesStatus && matchesDept && matchesCycle
    })
  }, [allAppraisals, search, statusFilter, deptFilter, cycleFilter])

  // Group by cycle name
  const grouped = useMemo(() => {
    const map = new Map<string, Appraisal[]>()
    filtered.forEach(a => {
      if (!map.has(a.cycleName)) map.set(a.cycleName, [])
      map.get(a.cycleName)!.push(a)
    })
    // Sort cycles: most recent first (by cycleStartDate of first item)
    return Array.from(map.entries()).sort((a, b) => {
      const dateA = new Date(a[1][0].cycleStartDate).getTime()
      const dateB = new Date(b[1][0].cycleStartDate).getTime()
      return dateB - dateA
    })
  }, [filtered])

  const toggleCycle = (name: string) => {
    setExpandedCycles(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const getCycleStats = (appraisals: Appraisal[]) => {
    const total = appraisals.length
    const done = appraisals.filter(a => a.appraisalStatus === 'APPROVED' || a.appraisalStatus === 'ACKNOWLEDGED').length
    const needsApproval = appraisals.filter(a => a.appraisalStatus === 'MANAGER_REVIEWED').length
    return { total, done, needsApproval, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-violet-950 tracking-tight">Manage Appraisals</h1>
        <p className="text-sm text-violet-700/80 mt-1">View and manage all appraisal cycles</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-600/70" />
          <input
            className="w-full h-9 rounded-md border border-violet-100 bg-white pl-9 pr-3 text-sm text-violet-950 placeholder:text-violet-600/70 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            placeholder="Search employee, manager, cycle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-violet-100 bg-white px-3 text-sm text-violet-950 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as AppraisalStatus | 'ALL')}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-violet-100 bg-white px-3 text-sm text-violet-950 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-violet-100 bg-white px-3 text-sm text-violet-950 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          value={cycleFilter}
          onChange={e => setCycleFilter(e.target.value)}
        >
          <option value="">All Cycles</option>
          {cycleNames.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(search || statusFilter !== 'ALL' || deptFilter || cycleFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('ALL'); setDeptFilter(''); setCycleFilter('') }}>
            Clear filters
          </Button>
        )}
      </div>

      {loading && <div className="text-center py-12 text-violet-600/70 text-sm">Loading appraisals...</div>}

      {!loading && grouped.length === 0 && (
        <div className="text-center py-16 text-violet-600/70">
          <p className="text-sm font-medium">No appraisals found</p>
          <p className="text-xs mt-1">{search || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'Create an appraisal to get started'}</p>
        </div>
      )}

      {/* Grouped by cycle */}
      <div className="space-y-4">
        {grouped.map(([cycleName, appraisals]) => {
          const stats = getCycleStats(appraisals)
          const isExpanded = expandedCycles.has(cycleName)
          const sample = appraisals[0]

          return (
            <Card key={cycleName}>
              {/* Cycle header — clickable to expand/collapse */}
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-violet-50/50 transition-colors rounded-t-xl"
                onClick={() => toggleCycle(cycleName)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-violet-950">{cycleName}</p>
                    <p className="text-xs text-violet-600/70 mt-0.5">
                      {format(new Date(sample.cycleStartDate), 'MMM d, yyyy')} — {format(new Date(sample.cycleEndDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-violet-700/80">{stats.total} appraisals</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-emerald-600 font-medium">{stats.pct}% complete</span>
                    {stats.needsApproval > 0 && (
                      <>
                        <span className="text-slate-300">·</span>
                        <Badge variant="warning">{stats.needsApproval} need approval</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* Mini progress bar */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: `${stats.pct}%` }} />
                    </div>
                    <span className="text-xs text-violet-600/70">{stats.done}/{stats.total}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={16} className="text-violet-600/70" /> : <ChevronRight size={16} className="text-violet-600/70" />}
                </div>
              </button>

              {/* Appraisals table */}
              {isExpanded && (
                <div className="border-t border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-violet-50/50/50">
                          {['Employee', 'Department', 'Manager', 'Status', 'Submitted', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2.5 px-4 text-xs font-medium text-violet-700/80 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {appraisals.map(a => (
                          <tr key={a.id} className="hover:bg-violet-50/50 transition-colors">
                            <td className="py-3 px-4 font-medium text-violet-950">{a.employeeName}</td>
                            <td className="py-3 px-4 text-violet-700/80 text-xs">{a.employeeDepartment || '—'}</td>
                            <td className="py-3 px-4 text-violet-700/80 text-xs">{a.managerName}</td>
                            <td className="py-3 px-4"><StatusBadge status={a.appraisalStatus} /></td>
                            <td className="py-3 px-4 text-violet-600/70 text-xs">
                              {a.submittedAt ? format(new Date(a.submittedAt), 'MMM d, yyyy') : '—'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/hr/appraisals/${a.id}`)}
                                  className="gap-1"
                                >
                                  <Eye size={13} />
                                  View
                                </Button>
                                {a.appraisalStatus === 'MANAGER_REVIEWED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => approve.mutate(a.id)}
                                    disabled={approve.isPending}
                                    className="gap-1"
                                  >
                                    <CheckCircle size={13} />
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
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
