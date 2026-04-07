import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTeamAppraisals } from '../../api/appraisals'
import { getGoalsByAppraisal, createGoal, updateGoal, deleteGoal } from '../../api/goals'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select } from '../../components/ui/select'
import { Dialog } from '../../components/ui/dialog'
import { GoalStatusBadge } from '../../components/StatusBadge'
import { format, isPast } from 'date-fns'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import type { Goal } from '../../types'

export function ManagerGoalsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [form, setForm] = useState({ appraisalId: '', title: '', description: '', dueDate: '' })

  const { data: appraisals = [] } = useQuery({
    queryKey: ['team-appraisals', user?.id],
    queryFn: () => getTeamAppraisals(user!.id),
    enabled: !!user,
  })

  // Fetch goals for all team appraisals
  const appraisalIds = appraisals.map(a => a.id)
  const { data: allGoals = [] } = useQuery({
    queryKey: ['all-team-goals', appraisalIds],
    queryFn: async () => {
      const results = await Promise.all(appraisalIds.map(id => getGoalsByAppraisal(id).catch(() => [])))
      return results.flat()
    },
    enabled: appraisalIds.length > 0,
  })

  const openAdd = () => { setEditing(null); setForm({ appraisalId: '', title: '', description: '', dueDate: '' }); setOpen(true) }
  const openEdit = (g: Goal) => { setEditing(g); setForm({ appraisalId: String(g.appraisalId), title: g.title, description: g.description, dueDate: g.dueDate }); setOpen(true) }

  const save = useMutation({
    mutationFn: () => {
      if (!editing && !form.appraisalId) throw new Error('Appraisal is required')
      return editing
        ? updateGoal(editing.id, user!.id, { title: form.title, description: form.description, dueDate: form.dueDate })
        : createGoal(user!.id, { appraisalId: Number(form.appraisalId), title: form.title, description: form.description, dueDate: form.dueDate })
    },
    onSuccess: () => { toast.success(editing ? 'Goal updated' : 'Goal created'); setOpen(false); qc.invalidateQueries({ queryKey: ['all-team-goals'] }) },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message
      toast.error(msg === 'Appraisal is required' ? 'Please select an appraisal' : `Failed to save goal: ${msg}`)
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteGoal(id, user!.id),
    onSuccess: () => { toast.success('Goal deleted'); qc.invalidateQueries({ queryKey: ['all-team-goals'] }) },
    onError: () => toast.error('Failed to delete goal'),
  })

  const getAppraisalLabel = (id: number) => {
    const a = appraisals.find(a => a.id === id)
    return a ? `${a.employeeName} — ${a.cycleName}` : `Appraisal #${id}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-violet-950">Team Goals</h1>
          <p className="text-violet-700/80 text-sm mt-1">Manage goals for your team members</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus size={16} />Add Goal</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {allGoals.length === 0 ? (
            <p className="text-center text-violet-600/70 py-8">No goals yet. Add a goal for a team member.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-violet-100">
                    {['Employee / Cycle', 'Goal', 'Due Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-violet-700/80 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allGoals.map(g => (
                    <tr key={g.id} className="border-b border-slate-100 hover:bg-violet-50/50">
                      <td className="py-3 px-4 text-slate-600 text-xs">{getAppraisalLabel(g.appraisalId)}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-violet-950">{g.title}</p>
                        <p className="text-xs text-violet-600/70 truncate max-w-[200px]">{g.description}</p>
                      </td>
                      <td className={`py-3 px-4 text-sm ${isPast(new Date(g.dueDate)) && g.status !== 'COMPLETED' ? 'text-red-600 font-medium' : 'text-violet-700/80'}`}>
                        {format(new Date(g.dueDate), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <GoalStatusBadge status={g.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(g)}><Pencil size={14} /></Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => remove.mutate(g.id)}><Trash2 size={14} /></Button>
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

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Goal' : 'Add Goal'}>
          <form onSubmit={e => { e.preventDefault(); save.mutate() }} className="space-y-4">
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Appraisal *</label>
                <Select value={form.appraisalId} onChange={e => setForm(f => ({ ...f, appraisalId: e.target.value }))} required>
                  <option value="">Select appraisal</option>
                  {appraisals.map(a => <option key={a.id} value={a.id}>{a.employeeName} — {a.cycleName}</option>)}
                </Select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Complete React course" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the goal..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving...' : 'Save Goal'}</Button>
            </div>
          </form>
      </Dialog>
    </div>
  )
}
