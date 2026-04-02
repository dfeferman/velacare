import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Velacare — Pflegehilfsmittel',
  description: 'Pflegehilfsmittel kostenlos über die Pflegekasse. Monatlich geliefert.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="font-sans bg-bg text-dark antialiased selection:bg-terra/20">
        <Nav />
        <main className="pt-[52px]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
