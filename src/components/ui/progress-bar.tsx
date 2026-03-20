interface ProgressBarProps {
  schritt: number
  gesamtSchritte: number
  label?: string
}

export function ProgressBar({ schritt, gesamtSchritte, label }: ProgressBarProps) {
  const prozent = (schritt / gesamtSchritte) * 100

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-warm-gray font-medium">{label}</span>
          <span className="text-xs text-warm-gray">Schritt {schritt} von {gesamtSchritte}</span>
        </div>
      )}
      <div className="w-full h-1 bg-mid-gray rounded-full overflow-hidden">
        <div
          className="h-full bg-terra rounded-full transition-all duration-500 ease-out"
          style={{ width: `${prozent}%` }}
        />
      </div>
    </div>
  )
}
