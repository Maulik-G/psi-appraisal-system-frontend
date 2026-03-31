import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const variantClasses = {
  default: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm',
  outline: 'border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 shadow-sm',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  secondary: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs h-8',
  md: 'px-4 py-2 text-sm h-9',
  lg: 'px-5 py-2.5 text-sm h-10',
  icon: 'w-9 h-9 p-0',
}

export function Button({ variant = 'default', size = 'md', className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
