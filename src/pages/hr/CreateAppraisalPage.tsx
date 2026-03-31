import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getUsers } from '../../api/users'
import { getDepartments } from '../../api/departments'
import { createAppraisal, createBulkCycle } from '../../api/appraisals'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Users, Building2, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

type Mode = 'single' | 'department' | 'all'

export function CreateAppraisalPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('single')
  const [form, setForm] = useState({
    cycleName: '', cycleStartDate: '', cycleEndDate: '',
    employeeId: '', managerId: '', departmentId: '',
  })
  const [bulkResult, setBulkResult] = useState<{ created: number; skippedAlreadyExists: number; skippedNoManager: number } | null>(null)

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })

  const employees = users.filter(u => u.role === 'EMPLOYEE' && u.isActive)
  const managers = users.filter(u => u.role === 'MANAGER' && u.isActive)

  const handleEmployeeChange = (employeeId: string) => {
    const emp = employees.find(e => e.id === Number(employeeId))
    setForm(f => ({ ...f, employeeId, managerId: emp?.managerId?.toString() || '' }))
  }

  // Single employee
  const createSingle = useMutation({
    mutationFn: () => createAppraisal({
      cycleName: form.cycleName,
      cycleStartDate: form.cycleStartDate,
      cycleEndDate: form.cycleEndDate,
      employeeId: Number(form.employeeId),
      managerId: Number(form.managerId),
    }),
    onSuccess: (data) => { toast.success('Appraisal created'); navigate(`/hr/appraisals/${data.id}`) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create appraisal'),
  })

  // Bulk (department or all)
  const createBulk = useMutation({
    mutationFn: () => createBulkCycle({
      cycleName: form.cycleName,
      cycleStartDate: form.cycleStartDate,
      cycleEndDate: form.cycleEndDate,
      ...(mode === 'department' && form.departmentId ? { departmentId: Number(form.departmentId) } : {}),
    }),
    onSuccess: (data: any) => {
      setBulkResult(data)
      toast.success(`Created ${data.created} appraisal${data.created !== 1 ? 's' : ''}`)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create appraisals'),
  })

  const cycleFields = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-700 mb-1.5">Cycle Name *</label>
        <Input placeholder="e.g. Q1 2026" value={form.cycleName} onChange={e => setForm(f => ({ ...f, cycleName: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">Start Date *</label>
          <Input type="date" value={form.cycleStartDate} onChange={e => setForm(f => ({ ...f, cycleStartDate: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">End Date *</label>
          <Input type="date" value={form.cycleEndDate} onChange={e => setForm(f => ({ ...f, cycleEndDate: e.target.value }))} required />
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Create Appraisal</h1>
        <p className="text-zinc-500 text-sm mt-1">Start a new appraisal cycle</p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'single', label: 'Single Employee', desc: 'One specific employee', icon: User },
          { key: 'department', label: 'By Department', desc: 'All employees in a dept', icon: Building2 },
          { key: 'all', label: 'All Employees', desc: 'Every active employee', icon: Users },
        ] as const).map(({ key, label, desc, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setMode(key); setBulkResult(null) }}
            className={cn(
              'flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all',
              mode === key
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
            )}
          >
            <Icon size={16} />
            <p className="text-xs font-semibold">{label}</p>
            <p className={cn('text-xs', mode === key ? 'text-zinc-300' : 'text-zinc-400')}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'single' ? 'Appraisal Details' : mode === 'department' ? 'Department Cycle' : 'Company-wide Cycle'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mode === 'single' && (
            <form onSubmit={e => { e.preventDefault(); createSingle.mutate() }} className="space-y-4">
              {cycleFields}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Employee *</label>
                <Select value={form.employeeId} onChange={e => handleEmployeeChange(e.target.value)} required>
                  <option value="">Select employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} — {e.jobTitle}{e.departmentName ? ` (${e.departmentName})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Manager *</label>
                <Select value={form.managerId} onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))} required>
                  <option value="">Select manager</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </Select>
              </div>
              <Button type="submit" disabled={createSingle.isPending} className="w-full">
                {createSingle.isPending ? 'Creating...' : 'Create Appraisal'}
              </Button>
            </form>
          )}

          {mode === 'department' && (
            <form onSubmit={e => { e.preventDefault(); createBulk.mutate() }} className="space-y-4">
              {cycleFields}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Department *</label>
                <Select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} required>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <p className="text-xs text-zinc-400">
                Creates one appraisal per active employee in the selected department. Employees without a manager are skipped.
              </p>
              <Button type="submit" disabled={createBulk.isPending} className="w-full">
                {createBulk.isPending ? 'Creating...' : 'Create for Department'}
              </Button>
            </form>
          )}

          {mode === 'all' && (
            <form onSubmit={e => { e.preventDefault(); createBulk.mutate() }} className="space-y-4">
              {cycleFields}
              <p className="text-xs text-zinc-400">
                Creates one appraisal per active employee across the entire company. Employees without a manager are skipped. Already-existing appraisals for this cycle are skipped.
              </p>
              <Button type="submit" disabled={createBulk.isPending} className="w-full">
                {createBulk.isPending ? 'Creating...' : `Create for All Employees (${employees.length})`}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Bulk result summary */}
      {bulkResult && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-sm font-medium text-zinc-900 mb-3">Cycle created</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="success">{bulkResult.created} created</Badge>
              </div>
              {bulkResult.skippedAlreadyExists > 0 && (
                <Badge variant="secondary">{bulkResult.skippedAlreadyExists} already existed</Badge>
              )}
              {bulkResult.skippedNoManager > 0 && (
                <Badge variant="warning">{bulkResult.skippedNoManager} skipped (no manager)</Badge>
              )}
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/hr/dashboard')}>
              View Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
