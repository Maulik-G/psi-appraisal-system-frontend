import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users'
import { getDepartments } from '../../api/departments'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Dialog } from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { UserAvatar } from '../../components/UserAvatar'
import { Plus, Pencil, UserX } from 'lucide-react'
import { toast } from 'sonner'
import type { User, Role } from '../../types'

const emptyForm = { fullName: '', email: '', password: '', role: 'EMPLOYEE' as Role, jobTitle: '', departmentId: '', managerId: '' }

export function UsersPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })
  const managers = users.filter(u => u.role === 'MANAGER')

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        fullName: form.fullName, email: form.email, role: form.role, jobTitle: form.jobTitle,
        ...(form.password && { password: form.password }),
        ...(form.departmentId && { departmentId: Number(form.departmentId) }),
        ...(form.managerId && { managerId: Number(form.managerId) }),
      }
      return editing ? updateUser(editing.id, payload) : createUser(payload)
    },
    onSuccess: () => { toast.success(editing ? 'User updated' : 'User created'); qc.invalidateQueries({ queryKey: ['users'] }); setOpen(false) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save user'),
  })

  const deactivate = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: () => toast.error('Failed to deactivate'),
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (u: User) => {
    setEditing(u)
    setForm({ fullName: u.fullName, email: u.email, password: '', role: u.role, jobTitle: u.jobTitle, departmentId: '', managerId: u.managerId?.toString() || '' })
    setOpen(true)
  }

  const roleBadge: Record<Role, 'destructive' | 'blue' | 'success'> = { HR: 'destructive', MANAGER: 'blue', EMPLOYEE: 'success' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all system users</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add User</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Name', 'Email', 'Role', 'Job Title', 'Department', 'Manager', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={u.fullName} role={u.role} size="sm" />
                        <span className="font-medium text-slate-900">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4"><Badge variant={roleBadge[u.role]}>{u.role}</Badge></td>
                    <td className="py-3 px-4 text-slate-600">{u.jobTitle}</td>
                    <td className="py-3 px-4 text-slate-500">{u.departmentName || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{u.managerName || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.isActive ? 'success' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(u)}><Pencil size={12} /></Button>
                        {u.isActive && (
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm('Deactivate this user?')) deactivate.mutate(u.id) }}>
                            <UserX size={12} />
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

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={e => { e.preventDefault(); save.mutate() }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
            <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role, managerId: '' }))}>
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="HR">HR</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
            <Input value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <Select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          {form.role !== 'HR' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Manager {form.role === 'EMPLOYEE' ? '*' : '(optional)'}
              </label>
              <Select value={form.managerId} onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))}>
                <option value="">Select manager</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
              </Select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={save.isPending} className="flex-1">
              {save.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
