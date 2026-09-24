import { useState } from 'react'
import { addDays, dateKey, dateRange, formatDay, parseKey } from '../lib/date'
import type { AppData } from '../lib/types'
import { PRAYER_LABELS, PRAYERS, STATUS_LABELS } from '../lib/types'
import { DayLogger, type DayActions } from './DayLogger'

interface Props extends DayActions {
  data: AppData
  now: Date
}

export function HistoryView({ data, now, ...actions }: Props) {
  const today = dateKey(now)
  const [date, setDate] = useState(() => addDays(today, -1))
  const [showAllOwed, setShowAllOwed] = useState(false)
  const recent = dateRange(addDays(today, -13), today).reverse()
  const owed = Object.keys(data.logs)
    .sort()
    .reverse()
    .flatMap((d) => PRAYERS.filter((p) => data.logs[d][p]?.status === 'missed').map((p) => ({ date: d, prayer: p })))

  return (
    <section>
      {owed.length > 0 && (
        <div className="card">
          <div className="card-head">
            <h2>Prayers to make up</h2>
            <span className="muted small">{owed.length} owed</span>
          </div>
          <p className="muted small">When you pray a missed prayer, mark it here and it will be logged as qada.</p>
          <ul className="owed">
            {(showAllOwed ? owed : owed.slice(0, 5)).map(({ date: d, prayer: p }) => (
              <li key={`${d}-${p}`}>
                <span>
                  <strong>{PRAYER_LABELS[p]}</strong>{' '}
                  <span className="muted">
                    {parseKey(d).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </span>
                <button
                  className="small"
                  onClick={() =>
                    actions.setPrayer(d, p, {
                      ...data.logs[d][p]!,
                      status: 'qada',
                      prayedAt: new Date().toISOString(),
                      loggedAt: new Date().toISOString(),
                    })
                  }
                >
                  Made up
                </button>
              </li>
            ))}
          </ul>
          {owed.length > 5 && (
            <button className="ghost small" onClick={() => setShowAllOwed(!showAllOwed)}>
              {showAllOwed ? 'Show fewer' : `Show all ${owed.length}`}
            </button>
          )}
        </div>
      )}

      <div className="card">
        <h2>Last 14 days</h2>
        <p className="muted small">Tap a day to edit it.</p>
        <ul className="recent">
          {recent.map((d) => (
            <li key={d}>
              <button className={d === date ? 'active' : ''} onClick={() => setDate(d)}>
                <span className="recent-day">
                  {parseKey(d).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <span className="dots">
                  {PRAYERS.map((p) => {
                    const s = data.logs[d]?.[p]?.status
                    return (
                      <span
                        key={p}
                        className={`dot ${s ? `status-${s}` : 'unlogged'}`}
                        title={`${PRAYER_LABELS[p]}: ${s ? STATUS_LABELS[s] : 'Not logged'}`}
                      />
                    )
                  })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="day-nav">
        <button className="ghost" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
          ‹
        </button>
        <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <button className="ghost" onClick={() => setDate(addDays(date, 1))} disabled={date >= today} aria-label="Next day">
          ›
        </button>
      </div>
      <h2 className="day-title">{formatDay(date)}</h2>
      <DayLogger date={date} data={data} now={now} {...actions} />
    </section>
  )
}
