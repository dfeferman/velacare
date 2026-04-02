import { requireAdmin } from '@/lib/auth/require-admin'
import { MfaEnrollment } from './mfa-enrollment'

export default async function EinstellungenPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Einstellungen</h1>

      <section className="mt-8 border-t border-outline pt-8">
        <MfaEnrollment />
      </section>
    </div>
  )
}
