import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

interface RatingStarsProps {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
}

export function RatingStars({ value, onChange, readonly = false }: RatingStarsProps) {
  return (
    <div className="flex gap-0.5">
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
            size={18}
            className={cn(
              'transition-colors',
              star <= value ? 'fill-zinc-900 text-zinc-900' : 'text-zinc-200 fill-zinc-100'
            )}
          />
        </button>
      ))}
    </div>
  )
}
