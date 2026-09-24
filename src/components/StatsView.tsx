import { useMemo, useState } from 'react'
import { getSurah } from '../data/surahs'
import { addDays, dateKey, parseKey } from '../lib/date'
import { duePrayers } from '../lib/prayerTimes'
import { computeStats, firstLoggedDate } from '../lib/stats'
import type { AppData, PrayerStatus } from '../lib/types'
import { PRAYER_LABELS, PRAYERS, STATUS_LABELS } from '../lib/types'

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: 0 },
]

const STACK: PrayerStatus[] = ['on_time', 'late', 'qada', 'missed']
const pct = (x: number) => `${Math.round(x * 100)}%`

export function StatsView({ data, now }: { data: AppData; now: Date }) {
  const [range, setRange] = useState(30)
  const [hover, setHover] = useState<number | null>(null)
  const today = dateKey(now)
  const first = firstLoggedDate(data.logs)

  // `now` ticks every second; recomputing once a minute is plenty.
  const minute = Math.floor(now.getTime() / 60000)
  const stats = useMemo(() => {
    const start = range ? addDays(today, -(range - 1)) : (first ?? today)
    return computeStats(data.logs, start, today, duePrayers(today, data.settings, new Date(minute * 60000)))
  }, [data, range, today, first, minute])

  if (!first) {
    return (
      <section className="card empty-state">
        <h2>No stats yet</h2>
        <p className="muted">Log a prayer on the Today tab and your stats will show up here.</p>
      </section>
    )
  }

  const daily = stats.daily.slice(-90)
  const topSurahs = stats.surahCounts.slice(0, 10)
  const maxSurah = topSurahs[0]?.count ?? 1
  const hovered = hover !== null ? daily[hover] : null

  return (
    <section className="stats">
      <div className="range" role="tablist">
        {RANGES.map((r) => (
          <button key={r.label} role="tab" aria-selected={range === r.days} className={range === r.days ? 'active' : ''} onClick={() => setRange(r.days)}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="tiles">
        <Tile label="Prayers completed" value={pct(stats.completionRate)} sub={`${stats.prayed} of ${stats.breakdown.due}`} />
        <Tile label="On time" value={pct(stats.onTimeRate)} sub={`${stats.breakdown.on_time} prayers`} />
        <Tile label="Current streak" value={`${stats.currentStreak}`} sub={`days · best ${stats.bestStreak}`} />
        <Tile label="In congregation" value={pct(stats.jamaahRate)} sub={`${stats.breakdown.jamaah} prayers`} />
        <Tile label="Surahs recited" value={`${stats.uniqueSurahs}`} sub="of 114 different" />
        <Tile label="Ayahs recited" value={stats.ayahsRecited.toLocaleString()} sub={`${stats.totalRecitations} recitations`} />
      </div>

      <div className="card">
        <h2>Prayers per day</h2>
        <p className="muted small">
          {hovered
            ? `${parseKey(hovered.date).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}: ${hovered.prayed} of ${hovered.due} prayed`
            : `Last ${daily.length} days · hover or tap a column for details`}
        </p>
        <div className="columns" onMouseLeave={() => setHover(null)}>
          <div className="gridlines" aria-hidden>
            {[5, 4, 3, 2, 1, 0].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          {daily.map((d, i) => (
            <div
              key={d.date}
              className={`col-slot${hover === i ? ' hovered' : ''}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setHover(i)}
              aria-label={`${d.date}: ${d.prayed} of ${d.due}`}
            >
              <div className="col" style={{ height: `${(d.prayed / 5) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>By prayer</h2>
        <div className="legend">
          {STACK.map((s) => (
            <span key={s}>
              <i className={`swatch status-${s}`} />
              {STATUS_LABELS[s]}
            </span>
          ))}
        </div>
        <div className="stacks">
          {PRAYERS.map((p) => {
            const b = stats.perPrayer[p]
            return (
              <div className="stack-row" key={p}>
                <span className="stack-label">{PRAYER_LABELS[p]}</span>
                <div className="stack">
                  {STACK.filter((s) => b[s] > 0).map((s) => (
                    <div
                      key={s}
                      className={`seg status-${s}`}
                      style={{ flexGrow: b[s] }}
                      title={`${PRAYER_LABELS[p]} · ${STATUS_LABELS[s]}: ${b[s]} (${pct(b[s] / b.due)})`}
                    />
                  ))}
                </div>
                <span className="stack-value">{b.due ? pct((b.due - b.missed) / b.due) : '–'}</span>
              </div>
            )
          })}
        </div>
        <details>
          <summary>Show as table</summary>
          <table>
            <thead>
              <tr>
                <th>Prayer</th>
                {STACK.map((s) => (
                  <th key={s}>{STATUS_LABELS[s]}</th>
                ))}
                <th>Jama'ah</th>
              </tr>
            </thead>
            <tbody>
              {PRAYERS.map((p) => (
                <tr key={p}>
                  <td>{PRAYER_LABELS[p]}</td>
                  {STACK.map((s) => (
                    <td key={s}>{stats.perPrayer[p][s]}</td>
                  ))}
                  <td>{stats.perPrayer[p].jamaah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>

      <div className="card">
        <h2>Most recited surahs</h2>
        {topSurahs.length === 0 ? (
          <p className="muted">Add the surahs you recite when logging a prayer to see them here.</p>
        ) : (
          <ul className="bars">
            {topSurahs.map(({ surah, count }) => (
              <li key={surah}>
                <span className="bar-label">
                  {surah}. {getSurah(surah)?.name}
                </span>
                <span className="bar-track">
                  <span className="bar" style={{ width: `${(count / maxSurah) * 100}%` }} />
                </span>
                <span className="bar-value">{count}×</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="tile">
      <span className="tile-label">{label}</span>
      <span className="tile-value">{value}</span>
      <span className="muted small">{sub}</span>
    </div>
  )
}
