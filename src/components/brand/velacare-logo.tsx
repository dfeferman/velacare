/** Markenzeichen aus Wireframe / Brandbook — Terra + Sage */
export function VelacareLogo({ className = 'h-6 w-6 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 80 80" aria-hidden>
      <path
        d="M15 70 C13 58,9 44,13 31 C16 21,25 13,40 12"
        fill="none"
        stroke="#C96B3F"
        strokeLinecap="round"
        strokeWidth="9"
      />
      <path
        d="M65 70 C67 58,71 44,67 31 C64 21,55 13,40 12"
        fill="none"
        stroke="#C96B3F"
        strokeLinecap="round"
        strokeWidth="9"
      />
      <circle cx="15" cy="70" fill="#C96B3F" r="6" />
      <circle cx="65" cy="70" fill="#C96B3F" r="6" />
      <path
        d="M40 46 C40 46,28 37,28 30 C28 25,32 22,35.5 22 C37.5 22,39 23,40 24.5 C41 23,42.5 22,44.5 22 C48 22,52 25,52 30 C52 37,40 46,40 46Z"
        fill="#2D7A5F"
      />
    </svg>
  )
}
