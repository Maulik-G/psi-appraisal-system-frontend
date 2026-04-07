import { cn } from '../../lib/utils'
import type { TextareaHTMLAttributes } from 'react'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-violet-100 bg-white px-3 py-2 text-sm text-violet-950 placeholder:text-violet-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 min-h-[100px] resize-y',
        className
      )}
      {...props}
    />
  )
}
