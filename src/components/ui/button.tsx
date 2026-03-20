import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-terra text-warm-white hover:bg-terra-dark',
  secondary: 'bg-transparent border border-terra text-terra hover:bg-terra-pale',
  ghost: 'bg-transparent text-warm-gray hover:text-dark hover:bg-bg',
  danger: 'bg-danger-pale text-danger hover:bg-danger hover:text-white',
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center px-5 py-2.5 rounded-md font-sans font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
