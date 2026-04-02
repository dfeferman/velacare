import { clsx } from 'clsx'

/** v3 semantic names (preferred) + legacy names (backward-compat) */
type BadgeVariant =
  | 'success' | 'warm' | 'info' | 'warning' | 'danger' | 'gray'
  // legacy — map to v3 colors
  | 'terra' | 'sage' | 'sky' | 'amber'

const variants: Record<BadgeVariant, string> = {
  // v3 semantic
  success: 'bg-v3-primary-pale text-v3-primary',
  warm:    'bg-v3-secondary-pale text-v3-secondary',
  info:    'bg-sky-pale text-sky',
  warning: 'bg-amber-pale text-amber',
  danger:  'bg-danger-pale text-danger',
  gray:    'bg-v3-primary-pale text-v3-on-surface-v',
  // legacy aliases
  terra:   'bg-v3-primary-pale text-v3-primary',
  sage:    'bg-v3-secondary-pale text-v3-secondary',
  sky:     'bg-sky-pale text-sky',
  amber:   'bg-amber-pale text-amber',
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
