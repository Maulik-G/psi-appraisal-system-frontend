import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

interface RatingStarsProps {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: number
  className?: string
}

export function RatingStars({ value, onChange, readonly = false, size = 18, className }: RatingStarsProps) {
  return (
    <div className={cn("flex gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            'transition-transform duration-100',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              star <= value ? 'fill-slate-900 text-violet-950' : 'text-slate-200 fill-slate-100'
            )}
          />
        </button>
      ))}
    </div>
  )
}
