import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getUsers } from '../../api/users'
import { getDepartments } from '../../api/departments'
import { approveAppraisal } from '../../api/appraisals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { StatusBadge } from '../../components/StatusBadge'
import { format } from 'date-fns'
import { Users, ClipboardCheck, Clock, CheckCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Appraisal, AppraisalStatus } from '../../types'
import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import type { ApiResponse } from '../../types'

const ALL_STATUSES: AppraisalStatus[] = [
  'PENDING', 'EMPLOYEE_DRAFT', 'SELF_SUBMITTED',
  'MANAGER_DRAFT', 'MANAGER_REVIEWED', 'APPROVED', 'ACKNOWLEDGED',
]

export function HRDashboard() {
  const navigate = useNavigate()
  const [appraisals, setAppraisals] = useState<Appraisal[]>([])

  // Filter state
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterCycle, setFilterCycle] = useState('')

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })

  useEffect(() => {
    const employees = users.filter(u => u.role === 'EMPLOYEE')
    if (employees.length === 0) return
    Promise.all(
      employees.map(e =>
        api.get<ApiResponse<Appraisal[]>>(`/api/appraisals/my?employeeId=${e.id}`)
          .then(r => r.data.data).catch(() => [])
      )
    ).then(results => setAppraisals(results.flat()))
  }, [users])

  const approve = useMutation({
    mutationFn: (id: number) => approveAppraisal(id),
    onSuccess: () => {
      toast.success('Appraisal approved')
      // Refresh appraisals
      const employees = users.filter(u => u.role === 'EMPLOYEE')
      Promise.all(
        employees.map(e =>
          api.get<ApiResponse<Appraisal[]>>(`/api/appraisals/my?employeeId=${e.id}`)
            .then(r => r.data.data).catch(() => [])
        )
      ).then(results => setAppraisals(results.flat()))
    },
    onError: () => toast.error('Failed to approve'),
  })

  // Unique cycle names for filter dropdown
  const cycleNames = useMemo(() =>
    [...new Set(appraisals.map(a => a.cycleName))].sort(),
    [appraisals]
  )

  // Apply filters
  const filtered = useMemo(() => {
    return appraisals.filter(a => {
      if (filterStatus && a.appraisalStatus !== filterStatus) return false
      if (filterDept && a.employeeDepartment !== filterDept) return false
      if (filterCycle && a.cycleName !== filterCycle) return false
      return true
    })
  }, [appraisals, filterStatus, filterDept, filterCycle])

  const hasFilters = filterStatus || filterDept || filterCycle
  const clearFilters = () => { setFilterStatus(''); setFilterDept(''); setFilterCycle('') }

  const activeEmployees = users.filter(u => u.role === 'EMPLOYEE' && u.isActive).length
  const pendingApproval = appraisals.filter(a => a.appraisalStatus === 'MANAGER_REVIEWED').length
  const completed = appraisals.filter(a => a.appraisalStatus === 'ACKNOWLEDGED').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">HR Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Overview of all appraisals and employees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Employees', value: activeEmployees, icon: Users, color: 'text-zinc-600' },
          { label: 'Total Appraisals', value: appraisals.length, icon: ClipboardCheck, color: 'text-zinc-600' },
          { label: 'Pending Approval', value: pendingApproval, icon: Clock, color: 'text-amber-600' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="text-2xl font-semibold text-zinc-900 mt-1 tracking-tight">{value}</p>
                </div>
                <Icon size={18} className={color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appraisals table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>
              All Appraisals
              {hasFilters && (
                <span className="ml-2 text-xs font-normal text-zinc-400">
                  {filtered.length} of {appraisals.length}
                </span>
              )}
            </CardTitle>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-44 h-8 text-xs"
              >
                <option value="">All statuses</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </Select>

              <Select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="w-44 h-8 text-xs"
              >
                <option value="">All departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </Select>

              <Select
                value={filterCycle}
                onChange={e => setFilterCycle(e.target.value)}
                className="w-36 h-8 text-xs"
              >
                <option value="">All cycles</option>
                {cycleNames.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-xs">
                  <X size={12} /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {appraisals.length === 0 ? (
            <p className="text-center text-zinc-400 py-10 text-sm">No appraisals found. Create one to get started.</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-400 text-sm">No appraisals match the selected filters.</p>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2 text-xs">Clear filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {['Employee', 'Department', 'Manager', 'Cycle', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-3 font-medium text-zinc-900">{a.employeeName}</td>
                      <td className="py-3 px-3 text-zinc-500">{a.employeeDepartment || '—'}</td>
                      <td className="py-3 px-3 text-zinc-500">{a.managerName}</td>
                      <td className="py-3 px-3 text-zinc-700">{a.cycleName}</td>
                      <td className="py-3 px-3"><StatusBadge status={a.appraisalStatus} /></td>
                      <td className="py-3 px-3 text-zinc-400 text-xs">{format(new Date(a.createdAt), 'MMM d, yyyy')}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/hr/appraisals/${a.id}`)}>View</Button>
                          {a.appraisalStatus === 'MANAGER_REVIEWED' && (
                            <Button size="sm" onClick={() => approve.mutate(a.id)} disabled={approve.isPending}>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
