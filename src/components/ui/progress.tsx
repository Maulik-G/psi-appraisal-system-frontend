import { cn } from '../../lib/utils'

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  return (
    <div className={cn('w-full bg-zinc-100 rounded-full overflow-hidden', className)}>
      <div
        className="bg-zinc-900 h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
