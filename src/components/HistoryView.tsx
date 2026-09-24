import { useState } from 'react'
import { addDays, dateKey, dateRange, formatDay, parseKey } from '../lib/date'
import type { AppData, PrayerLog, PrayerName } from '../lib/types'
import { PRAYER_LABELS, PRAYERS, STATUS_LABELS } from '../lib/types'
import { DayLogger } from './DayLogger'

interface Props {
  data: AppData
  now: Date
  setPrayer: (date: string, prayer: PrayerName, log: PrayerLog | undefined) => void
}

export function HistoryView({ data, now, setPrayer }: Props) {
  const today = dateKey(now)
  const [date, setDate] = useState(() => addDays(today, -1))
  const recent = dateRange(addDays(today, -13), today).reverse()

  return (
    <section>
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
      <DayLogger date={date} data={data} now={now} setPrayer={setPrayer} />
    </section>
  )
}
