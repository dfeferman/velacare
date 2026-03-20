import { Button } from '@/components/ui/button'

export default function KontaktPage() {
  return (
    <div className="py-20 px-6 max-w-lg mx-auto">
      <h1 className="font-serif text-5xl font-semibold text-center mb-8">Kontakt</h1>
      <div className="bg-warm-white rounded-lg border border-mid-gray p-6 space-y-4">
        <input placeholder="Ihr Name" className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm" />
        <input placeholder="Ihre E-Mail" type="email" className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm" />
        <textarea rows={4} placeholder="Ihre Nachricht..." className="w-full px-3 py-2 rounded-md border border-mid-gray bg-bg text-sm resize-none" />
        <Button variant="primary" className="w-full">Nachricht senden (Demo)</Button>
      </div>
    </div>
  )
}
