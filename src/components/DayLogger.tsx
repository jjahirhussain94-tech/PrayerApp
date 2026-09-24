import { computeTimes, suggestStatus } from '../lib/prayerTimes'
import type { AppData, PrayerLog, PrayerName } from '../lib/types'
import { PRAYERS } from '../lib/types'
import { PrayerCard } from './PrayerCard'

interface Props {
  date: string
  data: AppData
  now: Date
  nextPrayer?: PrayerName
  setPrayer: (date: string, prayer: PrayerName, log: PrayerLog | undefined) => void
}

export function DayLogger({ date, data, now, nextPrayer, setPrayer }: Props) {
  const times = computeTimes(date, data.settings)
  const day = data.logs[date] ?? {}
  return (
    <div className="prayer-list">
      {PRAYERS.map((p) => (
        <PrayerCard
          key={p}
          prayer={p}
          time={times?.[p]}
          log={day[p]}
          isNext={p === nextPrayer}
          notYet={!!times && times[p] > now}
          suggest={() => suggestStatus(p, date, data.settings, new Date())}
          onChange={(log) => setPrayer(date, p, log)}
        />
      ))}
    </div>
  )
}
