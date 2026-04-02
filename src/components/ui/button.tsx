import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-v3-primary text-white hover:bg-v3-primary-mid active:bg-v3-primary-dark ripple-btn',
  secondary:
    'bg-transparent border border-v3-outline text-v3-on-surface hover:bg-v3-primary-pale hover:border-v3-primary',
  ghost:
    'bg-transparent text-v3-on-surface-v hover:text-v3-on-surface hover:bg-v3-primary-pale',
  danger:
    'bg-danger-pale text-danger hover:bg-danger hover:text-white',
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-[44px] cursor-pointer items-center justify-center px-5 py-2.5 rounded-md font-sans font-medium text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v3-primary focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
