import { KontoSidebar } from '@/components/layout/konto-sidebar'

export default function KontoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex gap-6 items-start">
        <KontoSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
