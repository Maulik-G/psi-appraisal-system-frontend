import { cn } from '../lib/utils'
import type { Role } from '../types'

const roleColors: Record<Role, string> = {
  HR: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
}

export function UserAvatar({ name, role, size = 'md' }: { name: string; role?: Role; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size]
  const colorClass = role ? roleColors[role] : 'bg-slate-100 text-slate-700'
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold', sizeClass, colorClass)}>
      {initials}
    </div>
  )
}
