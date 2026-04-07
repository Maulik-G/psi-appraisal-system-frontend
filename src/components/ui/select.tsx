import { cn } from '../../lib/utils'
import type { SelectHTMLAttributes } from 'react'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full h-9 rounded-md border border-violet-100 bg-white px-3 text-sm text-violet-950 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
