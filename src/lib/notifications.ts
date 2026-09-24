import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { ReminderTag } from '../data/reminders'
import { addDays, dateKey, formatTime, parseKey } from './date'
import { buildContext, chooseTag, pickReminder } from './encouragement'
import { computeTimes, windowEnd } from './prayerTimes'
import type { AppData, PrayerName } from './types'
import { PRAYER_LABELS, PRAYERS } from './types'

export interface ScheduledReminder {
  id: number
  at: Date
  title: string
  body: string
}

/** iOS keeps at most 64 pending local notifications per app. */
const IOS_LIMIT = 64
const DAYS_AHEAD = 5
/** Keep notification bodies short enough to read on the lock screen. */
const HADITH_MAX = 170

const PRAYER_TAG: Partial<Record<PrayerName, ReminderTag>> = { fajr: 'fajr', asr: 'asr', isha: 'isha' }

/** Stable numeric id per (day, prayer, kind), so a nudge can be cancelled once the prayer is logged. */
export function notificationId(date: string, prayer: PrayerName, kind: 'start' | 'nudge'): number {
  const days = Math.round(parseKey(date).getTime() / 86_400_000) % 100_000
  return days * 10 + PRAYERS.indexOf(prayer) * 2 + (kind === 'nudge' ? 1 : 0)
}

/** Pure schedule builder; the native layer just hands this list to the OS. */
export function buildSchedule(data: AppData, now = new Date()): ScheduledReminder[] {
  const { reminders } = data.settings
  if (!reminders.enabled || !data.settings.location) return []
  const today = dateKey(now)
  const ctx = buildContext(data, today, now)
  const out: ScheduledReminder[] = []

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = addDays(today, i)
    const times = computeTimes(date, data.settings)!
    const seed = date
    for (const p of PRAYERS) {
      const name = PRAYER_LABELS[p]
      if (reminders.atStart && times[p] > now) {
        const tag = PRAYER_TAG[p] ?? chooseTag({ ...ctx, nextPrayer: p }, i + PRAYERS.indexOf(p))
        const h = reminders.hadith ? pickReminder(tag, `${seed}:${p}`, HADITH_MAX) : undefined
        out.push({
          id: notificationId(date, p, 'start'),
          at: times[p],
          title: `${name} · ${formatTime(times[p])}`,
          body: h ? `“${h.text}” (${h.source})` : `It’s time for ${name}.`,
        })
      }

      const end = windowEnd(p, date, data.settings)!
      const nudgeAt = new Date(end.getTime() - reminders.nudgeMinutes * 60_000)
      if (reminders.nudgeMinutes > 0 && nudgeAt > now && nudgeAt > times[p] && !data.logs[date]?.[p]) {
        // A nudge is for someone who is behind, so lead with mercy and the value of praying on time.
        const tag: ReminderTag = ctx.missed >= 5 ? 'forgiveness' : 'on_time'
        const h = reminders.hadith ? pickReminder(tag, `${seed}:${p}:nudge`, HADITH_MAX) : undefined
        out.push({
          id: notificationId(date, p, 'nudge'),
          at: nudgeAt,
          title: `${name} ends in ${reminders.nudgeMinutes} min`,
          body: `You haven’t logged ${name} yet.${h ? ` “${h.text}” (${h.source})` : ''}`,
        })
      }
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, IOS_LIMIT)
}

export const notificationsSupported = () => Capacitor.isNativePlatform()

export async function requestPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  const { display } = await LocalNotifications.requestPermissions()
  return display === 'granted'
}

/** Replaces all pending reminders with a fresh schedule. */
export async function syncNotifications(data: AppData): Promise<void> {
  if (!notificationsSupported()) return
  const { notifications: pending } = await LocalNotifications.getPending()
  if (pending.length) await LocalNotifications.cancel({ notifications: pending.map((n) => ({ id: n.id })) })

  const schedule = buildSchedule(data)
  if (!schedule.length) return
  const { display } = await LocalNotifications.checkPermissions()
  if (display !== 'granted') return
  await LocalNotifications.schedule({
    notifications: schedule.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      schedule: { at: n.at, allowWhileIdle: true },
    })),
  })
}
