import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/layout/nav'
import { MockStoreProvider } from '@/lib/mock-store'

export const metadata: Metadata = {
  title: 'Velacare — Pflegehilfsmittel',
  description: 'Pflegehilfsmittel kostenlos über die Pflegekasse. Monatlich geliefert.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="font-sans bg-bg text-dark antialiased">
        <MockStoreProvider>
          <Nav />
          <main className="pt-14">{children}</main>
        </MockStoreProvider>
      </body>
    </html>
  )
}
