import { clsx } from 'clsx'

type BadgeVariant = 'terra' | 'sage' | 'sky' | 'amber' | 'danger' | 'gray'

const variants: Record<BadgeVariant, string> = {
  terra: 'bg-terra-pale text-terra',
  sage: 'bg-sage-pale text-sage',
  sky: 'bg-sky-pale text-sky',
  amber: 'bg-amber-pale text-amber',
  danger: 'bg-danger-pale text-danger',
  gray: 'bg-bg text-warm-gray',
}

export function Badge({ variant = 'gray', children, className }: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={clsx('inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap', variants[variant], className)}>
      {children}
    </span>
  )
}
