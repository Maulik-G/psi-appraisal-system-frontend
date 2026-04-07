import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple' | 'blue'
  className?: string
}

const variantClasses = {
  default:     'bg-violet-600 text-white',
  secondary:   'bg-slate-100 text-slate-600',
  destructive: 'bg-red-50 text-red-700 border border-red-200',
  outline:     'border border-violet-100 text-slate-600 bg-transparent',
  success:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning:     'bg-amber-50 text-amber-700 border border-amber-200',
  purple:      'bg-violet-50 text-violet-700 border border-violet-200',
  blue:        'bg-blue-50 text-blue-700 border border-blue-200',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-tight',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}
