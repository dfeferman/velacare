interface FortschrittsbalkenProps {
  aktuellerSchritt: number
  schritte: string[]
}

export function Fortschrittsbalken({ aktuellerSchritt, schritte }: FortschrittsbalkenProps) {
  return (
    <div className="flex items-center gap-0 w-full max-w-lg mx-auto mb-10">
      {schritte.map((schritt, i) => {
        const nummer = i + 1
        const abgeschlossen = nummer < aktuellerSchritt
        const aktiv = nummer === aktuellerSchritt
        return (
          <div key={schritt} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                abgeschlossen ? 'bg-terra text-white' :
                aktiv ? 'bg-terra text-white ring-4 ring-terra-pale' :
                'bg-bg border-2 border-mid-gray text-warm-gray'
              }`}>
                {abgeschlossen ? '✓' : nummer}
              </div>
              <span className={`text-xs whitespace-nowrap ${aktiv ? 'text-dark font-medium' : 'text-warm-gray'}`}>
                {schritt}
              </span>
            </div>
            {i < schritte.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 ${abgeschlossen ? 'bg-terra' : 'bg-mid-gray'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
