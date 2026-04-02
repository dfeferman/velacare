import { BUDGET_LIMIT_EUR } from '@/lib/dal/produkte'

interface BudgetAnzeigeProps {
  genutzt: number
}

export function BudgetAnzeige({ genutzt }: BudgetAnzeigeProps) {
  const prozent = Math.min((genutzt / BUDGET_LIMIT_EUR) * 100, 100)
  const ueberschritten = genutzt > BUDGET_LIMIT_EUR
  const verbleibend = BUDGET_LIMIT_EUR - genutzt

  return (
    <div className="bg-warm-white rounded-lg border border-mid-gray p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-medium tracking-widest uppercase text-warm-gray">Budget</span>
        <span className={`text-sm font-medium ${ueberschritten ? 'text-danger' : 'text-dark'}`}>
          {genutzt.toFixed(2).replace('.', ',')} € / {BUDGET_LIMIT_EUR.toFixed(2).replace('.', ',')} €
        </span>
      </div>
      <div className="w-full bg-bg rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${ueberschritten ? 'bg-danger' : 'bg-terra'}`}
          style={{ width: `${prozent}%` }}
        />
      </div>
      {ueberschritten ? (
        <p className="text-xs text-danger mt-2">Budget überschritten um {Math.abs(verbleibend).toFixed(2).replace('.', ',')} €</p>
      ) : (
        <p className="text-xs text-warm-gray mt-2">Noch {verbleibend.toFixed(2).replace('.', ',')} € verfügbar</p>
      )}
    </div>
  )
}
