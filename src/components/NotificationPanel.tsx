import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'

export function NotificationPanel() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: count = 0 } = useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: () => getUnreadCount(user!.id),
    enabled: !!user,
    refetchInterval: 30000,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => getNotifications(user!.id),
    enabled: !!user && open,
  })

  const markOne = useMutation({
    mutationFn: (id: number) => markAsRead(id, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const markAll = useMutation({
    mutationFn: () => markAllAsRead(user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-violet-700/80 hover:bg-violet-50 hover:text-violet-950 transition-colors"
      >
        <Bell size={17} />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-violet-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-violet-950">Notifications</span>
              {count > 0 && (
                <span className="bg-violet-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </div>
            {count > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-xs text-violet-700/80 hover:text-violet-950 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={20} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-violet-600/70">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markOne.mutate(n.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-violet-50/50 transition-colors ${!n.isRead ? 'bg-violet-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {!n.isRead && <div className="w-1.5 h-1.5 bg-violet-600 rounded-full mt-1.5 shrink-0" />}
                    <div className={!n.isRead ? '' : 'pl-4'}>
                      <p className="text-sm font-medium text-violet-950 leading-tight">{n.title}</p>
                      <p className="text-xs text-violet-700/80 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-violet-600/70 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
