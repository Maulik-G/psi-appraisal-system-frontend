import { cn } from '../../lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full h-9 rounded-md border border-violet-100 bg-white px-3 text-sm text-violet-950 placeholder:text-violet-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-0 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}
