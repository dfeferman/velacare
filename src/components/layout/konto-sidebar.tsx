'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const LINKS = [
  { href: '/konto', label: 'Dashboard', icon: '🏠' },
  { href: '/konto/meine-box', label: 'Meine Box', icon: '📦' },
  { href: '/konto/lieferungen', label: 'Lieferungen', icon: '🚚' },
  { href: '/konto/anfragen', label: 'Anfragen', icon: '💬' },
  { href: '/konto/einstellungen', label: 'Einstellungen', icon: '⚙️' },
]

export function KontoSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0">
      <nav className="bg-warm-white rounded-lg border border-mid-gray overflow-hidden">
        {LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 text-sm border-b border-mid-gray last:border-none transition-colors',
              pathname === link.href ? 'bg-terra-pale text-terra font-medium' : 'text-warm-gray hover:bg-bg hover:text-dark'
            )}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
