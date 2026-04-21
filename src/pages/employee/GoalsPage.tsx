import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyGoals, updateGoalProgress } from '../../api/goals'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import { Dialog } from '../../components/ui/dialog'
import { GoalStatusBadge } from '../../components/StatusBadge'
import { format, isPast } from 'date-fns'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import type { Goal } from '../../types'

export function EmployeeGoalsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Goal | null>(null)
  const [status, setStatus] = useState('IN_PROGRESS')

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['my-goals', user?.id],
    queryFn: () => getMyGoals(user!.id),
    enabled: !!user,
  })

  const update = useMutation({
    mutationFn: () => updateGoalProgress(selected!.id, user!.id, { status }),
    onSuccess: () => {
      toast.success('Status updated')
      setSelected(null)
      qc.invalidateQueries({ queryKey: ['my-goals'] })
    },
    onError: () => toast.error('Failed to update'),
  })

  const openUpdate = (g: Goal) => {
    setSelected(g)
    setStatus(g.status)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-violet-950 tracking-tight">My Goals</h1>
        <p className="text-violet-700/80 text-sm mt-1">{goals.length} target{goals.length !== 1 ? 's' : ''} assigned by manager</p>
      </div>

      {isLoading ? (
        <p className="text-violet-600/70 text-sm">Loading...</p>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 text-violet-600/70">
          <p className="text-sm font-medium">No goals yet</p>
          <p className="text-xs mt-1">Your manager will assign goals to you.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {goals.map(g => {
            const overdue = isPast(new Date(g.dueDate)) && g.status !== 'COMPLETED' && g.status !== 'CANCELLED'
            return (
              <Card key={g.id}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-medium text-violet-950">{g.title}</h3>
                        <GoalStatusBadge status={g.status} />
                      </div>
                      {g.description && <p className="text-sm text-violet-700/80 mt-1">{g.description}</p>}
                      <p className={`text-xs mt-1.5 ${overdue ? 'text-red-500 font-medium' : 'text-violet-600/70'}`}>
                        Due {format(new Date(g.dueDate), 'MMM d, yyyy')}{overdue ? ' · Overdue' : ''}
                      </p>
                    </div>
                    {g.status !== 'COMPLETED' && g.status !== 'CANCELLED' && (
                      <Button size="sm" variant="outline" onClick={() => openUpdate(g)} className="shrink-0">
                        Update Status
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} title={`Update Status — ${selected?.title ?? ''}`}>
        <form onSubmit={e => { e.preventDefault(); update.mutate() }} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
            <Select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button type="submit" disabled={update.isPending}>Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
