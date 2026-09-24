import { dateKey, formatDay, formatDuration, formatTime } from '../lib/date'
import { computeTimes, nextPrayer, qiblaDirection } from '../lib/prayerTimes'
import type { AppData, PrayerLog, PrayerName } from '../lib/types'
import { PRAYER_LABELS, PRAYERS } from '../lib/types'
import { DayLogger } from './DayLogger'

interface Props {
  data: AppData
  now: Date
  setPrayer: (date: string, prayer: PrayerName, log: PrayerLog | undefined) => void
  goToSettings: () => void
}

export function TodayView({ data, now, setPrayer, goToSettings }: Props) {
  const today = dateKey(now)
  const next = nextPrayer(today, data.settings, now)
  const times = computeTimes(today, data.settings)
  const loc = data.settings.location
  const day = data.logs[today] ?? {}
  const prayedCount = PRAYERS.filter((p) => day[p] && day[p]!.status !== 'missed').length
  // Only highlight "next" when it's today's prayer (after Isha it is tomorrow's Fajr).
  const nextToday = next && times && next.at.getDate() === now.getDate() ? next.prayer : undefined

  return (
    <section>
      <div className="hero">
        <p className="muted">{formatDay(today)}</p>
        {next ? (
          <>
            <p className="hero-label">
              {PRAYER_LABELS[next.prayer]} at {formatTime(next.at)}
            </p>
            <p className="hero-value">{formatDuration(next.at.getTime() - now.getTime())}</p>
          </>
        ) : (
          <div className="callout">
            <p>Set your location to see prayer times.</p>
            <button className="primary" onClick={goToSettings}>
              Set location
            </button>
          </div>
        )}
        <div className="hero-meta">
          <span>
            <strong>{prayedCount}</strong>/5 prayed today
          </span>
          {loc && (
            <span>
              Qibla{' '}
              <span className="qibla" style={{ transform: `rotate(${qiblaDirection(loc)}deg)` }} aria-hidden>
                ↑
              </span>{' '}
              {Math.round(qiblaDirection(loc))}° from N
            </span>
          )}
          {loc?.label && <span className="muted">{loc.label}</span>}
        </div>
        {times && (
          <p className="muted small">
            Sunrise {formatTime(times.sunrise)} · Fajr ends at sunrise
          </p>
        )}
      </div>
      <DayLogger date={today} data={data} now={now} nextPrayer={nextToday} setPrayer={setPrayer} />
    </section>
  )
}
