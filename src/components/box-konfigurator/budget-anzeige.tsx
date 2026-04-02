'use client'

interface BudgetAnzeigeProps {
  genutztProzent: number  // 0–100 (Prozent des Maximalbudgets)
  /** md = voller Ring mit Centertext (Sidebar/Desktop), sm = kompakter Ring inline (Mobile) */
  size?: 'sm' | 'md'
}

const R             = 38
const CX            = 48
const CY            = 48
const CIRCUMFERENCE = 2 * Math.PI * R  // ≈ 238.76

const PRIMARY      = '#4A7259'
const ERROR_COLOR  = '#E05A3A'
const TRACK_COLOR  = '#D5CAB9'
const TEXT_VARIANT = '#6B5747'

export function BudgetAnzeige({ genutztProzent, size = 'md' }: BudgetAnzeigeProps) {
  const prozent        = Math.min(genutztProzent, 100)
  const verbleibend    = Math.max(100 - genutztProzent, 0)
  const ueberschritten = genutztProzent > 100
  const dashOffset     = CIRCUMFERENCE * (1 - prozent / 100)
  const ringColor      = ueberschritten ? ERROR_COLOR : PRIMARY

  const isSm    = size === 'sm'
  const svgSize = isSm ? 56 : 96

  return (
    <div
      className={isSm ? 'flex items-center gap-3' : 'flex flex-col items-center'}
      role="img"
      aria-label={`${verbleibend.toFixed(0)} Prozent von 100 Prozent verfügbar`}
    >
      {/* SVG Ring */}
      <div className="relative shrink-0">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 96 96"
          aria-hidden="true"
          className="block"
        >
          {/* Track */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={TRACK_COLOR}
            strokeWidth="7"
            opacity="0.5"
          />
          {/* Filled arc */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 48 48)"
            style={{
              transition: 'stroke-dashoffset 0.65s cubic-bezier(.4,0,.2,1), stroke 0.3s',
            }}
          />
          {/* Center text — nur bei md */}
          {!isSm && (
            <>
              <text
                x="48" y="45"
                textAnchor="middle"
                fill={ringColor}
                fontFamily="DM Sans, system-ui, sans-serif"
                fontSize="14"
                fontWeight="700"
              >
                {verbleibend.toFixed(0)} %
              </text>
              <text
                x="48" y="57"
                textAnchor="middle"
                fill={TEXT_VARIANT}
                fontFamily="DM Sans, system-ui, sans-serif"
                fontSize="8.5"
              >
                verfügbar
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Labels */}
      {isSm ? (
        <div>
          <p className="text-sm font-semibold tabular-nums leading-tight" style={{ color: ringColor }}>
            {verbleibend.toFixed(0)} %
            <span className="text-v3-on-surface-v font-normal text-xs"> verfügbar</span>
          </p>
          <p className="text-xs text-v3-on-surface-v tabular-nums mt-0.5">
            {genutztProzent.toFixed(0)} % von 100 % genutzt
          </p>
        </div>
      ) : (
        <div className="mt-3 text-center space-y-1">
          <p className="text-xs text-v3-on-surface-v tabular-nums">
            <span className="font-medium text-v3-on-surface">{genutztProzent.toFixed(0)} %</span>
            {' '}von 100 % genutzt
          </p>
          {ueberschritten && (
            <p className="text-xs font-medium" style={{ color: ERROR_COLOR }}>
              Budget überschritten
            </p>
          )}
        </div>
      )}
    </div>
  )
}
