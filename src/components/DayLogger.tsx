import { computeTimes, suggestStatus } from '../lib/prayerTimes'
import type { AppData, ExtraPrayer, PrayerLog, PrayerName } from '../lib/types'
import { PRAYERS } from '../lib/types'
import { ExtrasCard } from './ExtrasCard'
import { PrayerCard } from './PrayerCard'

export interface DayActions {
  setPrayer: (date: string, prayer: PrayerName, log: PrayerLog | undefined) => void
  toggleExtra: (date: string, extra: ExtraPrayer) => void
}

interface Props extends DayActions {
  date: string
  data: AppData
  now: Date
  nextPrayer?: PrayerName
}

export function DayLogger({ date, data, now, nextPrayer, setPrayer, toggleExtra }: Props) {
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
      <ExtrasCard done={data.extras[date] ?? []} onToggle={(e) => toggleExtra(date, e)} />
    </div>
  )
}
