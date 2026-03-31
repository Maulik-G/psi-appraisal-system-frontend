import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog } from '../../components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Department } from '../../types'

export function DepartmentsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })

  const save = useMutation({
    mutationFn: () => editing ? updateDepartment(editing.id, { name, description }) : createDepartment({ name, description }),
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['departments'] }); setOpen(false) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['departments'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const openCreate = () => { setEditing(null); setName(''); setDescription(''); setOpen(true) }
  const openEdit = (d: Department) => { setEditing(d); setName(d.name); setDescription(d.description); setOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage organizational departments</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Department</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['Name', 'Description', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-slate-400">No departments yet</td></tr>
              ) : departments.map(d => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{d.name}</td>
                  <td className="py-3 px-4 text-slate-500">{d.description || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(d)}><Pencil size={12} /></Button>
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm('Delete this department?')) remove.mutate(d.id) }}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={e => { e.preventDefault(); save.mutate() }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={save.isPending} className="flex-1">{save.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
