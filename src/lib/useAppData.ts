import { App as NativeApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { syncNotifications } from './notifications'
import { loadData, loadNativeData, saveData } from './storage'
import type { AppData, ExtraPrayer, PrayerLog, PrayerName, Settings } from './types'

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData)
  const latest = useRef(data)

  // On iOS, Preferences is the durable copy; prefer it over the web view's storage.
  useEffect(() => {
    void loadNativeData().then((native) => native && setData(native))
  }, [])

  useEffect(() => {
    latest.current = data
    saveData(data)
  }, [data])

  // Reschedule reminders shortly after changes (e.g. logging a prayer cancels its nudge).
  useEffect(() => {
    const id = setTimeout(() => void syncNotifications(data).catch(() => {}), 1500)
    return () => clearTimeout(id)
  }, [data])

  // Top up the rolling schedule whenever the app comes back to the foreground.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const sub = NativeApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void syncNotifications(latest.current).catch(() => {})
    })
    return () => void sub.then((s) => s.remove())
  }, [])

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

  const toggleExtra = useCallback((date: string, extra: ExtraPrayer) => {
    setData((d) => {
      const current = d.extras[date] ?? []
      const next = current.includes(extra) ? current.filter((e) => e !== extra) : [...current, extra]
      const extras = { ...d.extras, [date]: next }
      if (next.length === 0) delete extras[date]
      return { ...d, extras }
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }, [])

  return { data, setData, setPrayer, toggleExtra, updateSettings }
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
