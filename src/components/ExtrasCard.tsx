import type { ExtraPrayer } from '../lib/types'
import { EXTRA_INFO, EXTRAS } from '../lib/types'

interface Props {
  done: ExtraPrayer[]
  onToggle: (extra: ExtraPrayer) => void
}

export function ExtrasCard({ done, onToggle }: Props) {
  const rawatib = EXTRAS.filter((e) => EXTRA_INFO[e].rawatib)
  const others = EXTRAS.filter((e) => !EXTRA_INFO[e].rawatib)
  const rakahs = done.reduce((n, e) => n + (EXTRA_INFO[e].rawatib ? (EXTRA_INFO[e].rakahs ?? 0) : 0), 0)
  return (
    <div className="card">
      <div className="card-head">
        <h2>Extra prayers</h2>
        <span className="muted small">{rakahs}/12 sunnah rak'ahs</span>
      </div>
      <div className="chips">
        {rawatib.map((e) => (
          <Toggle key={e} extra={e} on={done.includes(e)} onToggle={onToggle} />
        ))}
      </div>
      <div className="chips">
        {others.map((e) => (
          <Toggle key={e} extra={e} on={done.includes(e)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

function Toggle({ extra, on, onToggle }: { extra: ExtraPrayer; on: boolean; onToggle: (e: ExtraPrayer) => void }) {
  return (
    <button className={`chip choice${on ? ' selected' : ''}`} aria-pressed={on} onClick={() => onToggle(extra)}>
      {on ? '✓ ' : ''}
      {EXTRA_INFO[extra].label}
    </button>
  )
}
