import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyAppraisals } from '../../api/appraisals'
import { getMyFeedback, submitFeedback } from '../../api/feedback'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Select } from '../../components/ui/select'
import { RatingStars } from '../../components/RatingStars'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

export function FeedbackPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'received' | 'give'>('received')
  const [form, setForm] = useState({ appraisalId: '', comments: '', rating: 0, feedbackType: 'PEER' })

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['my-feedback', user?.id],
    queryFn: () => getMyFeedback(user!.id),
    enabled: !!user,
  })

  const { data: appraisals = [] } = useQuery({
    queryKey: ['my-appraisals', user?.id],
    queryFn: () => getMyAppraisals(user!.id),
    enabled: !!user,
  })

  const submit = useMutation({
    mutationFn: () => submitFeedback(user!.id, {
      appraisalId: Number(form.appraisalId),
      revieweeId: user!.id,
      comments: form.comments,
      rating: form.rating,
      feedbackType: form.feedbackType,
    }),
    onSuccess: () => {
      toast.success('Feedback submitted')
      setForm({ appraisalId: '', comments: '', rating: 0, feedbackType: 'PEER' })
      qc.invalidateQueries({ queryKey: ['my-feedback'] })
    },
    onError: () => toast.error('Failed to submit feedback'),
  })

  const feedbackTypeColor: Record<string, string> = {
    SELF: 'bg-purple-100 text-purple-700',
    PEER: 'bg-blue-100 text-blue-700',
    MANAGER: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Feedback</h1>
        <p className="text-slate-500 text-sm mt-1">View received feedback and submit your own</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['received', 'give'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'received' ? 'Received Feedback' : 'Give Feedback'}
          </button>
        ))}
      </div>

      {tab === 'received' && (
        <div>
          {feedbacks.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-medium">No feedback yet</p>
              <p className="text-sm mt-1">Feedback from your manager and peers will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map(f => (
                <Card key={f.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-900">{f.reviewerName}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${feedbackTypeColor[f.feedbackType]}`}>{f.feedbackType}</span>
                        <RatingStars value={f.rating} readonly />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{f.comments}</p>
                    <p className="text-xs text-slate-400 mt-2">{format(new Date(f.createdAt), 'MMM d, yyyy')}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'give' && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={e => { e.preventDefault(); submit.mutate() }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Appraisal *</label>
                <Select value={form.appraisalId} onChange={e => setForm(f => ({ ...f, appraisalId: e.target.value }))} required>
                  <option value="">Select appraisal</option>
                  {appraisals.map(a => <option key={a.id} value={a.id}>{a.cycleName}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback Type</label>
                <Select value={form.feedbackType} onChange={e => setForm(f => ({ ...f, feedbackType: e.target.value }))}>
                  <option value="PEER">Peer</option>
                  <option value="SELF">Self</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comments *</label>
                <Textarea
                  value={form.comments}
                  onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                  required rows={4}
                  placeholder="Share your feedback..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating *</label>
                <RatingStars value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
              </div>
              <Button type="submit" disabled={submit.isPending || form.rating === 0} className="w-full">
                {submit.isPending ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
