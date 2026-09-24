import { useCallback, useEffect, useState } from 'react'
import { loadData, saveData } from './storage'
import type { AppData, PrayerLog, PrayerName, Settings } from './types'

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => saveData(data), [data])

  const setPrayer = useCallback((date: string, prayer: PrayerName, log: PrayerLog | undefined) => {
    setData((d) => {
      const day = { ...d.logs[date] }
      if (log) day[prayer] = log
      else delete day[prayer]
      const logs = { ...d.logs, [date]: day }
      if (Object.keys(day).length === 0) delete logs[date]
      return { ...d, logs }
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }, [])

  return { data, setData, setPrayer, updateSettings }
}

/** Re-renders on an interval so countdowns and "today" stay current. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
