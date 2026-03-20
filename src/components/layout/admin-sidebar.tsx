'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/kunden', label: 'Kunden', icon: '👥' },
  { href: '/admin/produkte', label: 'Produkte', icon: '📦' },
  { href: '/admin/lieferungen', label: 'Lieferungen', icon: '🚚' },
  { href: '/admin/anfragen', label: 'Anfragen', icon: '💬' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0">
      <div className="bg-dark rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-warm-white/10">
          <p className="font-serif text-warm-white text-sm font-semibold">Velacare Admin</p>
          <p className="text-xs text-warm-white/40 mt-0.5">Internes Panel</p>
        </div>
        <nav>
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 text-sm border-b border-warm-white/5 last:border-none transition-colors',
                pathname === link.href ? 'bg-terra/20 text-terra-light' : 'text-warm-white/50 hover:bg-warm-white/5 hover:text-warm-white'
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
