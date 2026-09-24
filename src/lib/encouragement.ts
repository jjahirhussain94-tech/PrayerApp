import type { Reminder, ReminderTag } from '../data/reminders'
import { remindersFor } from '../data/reminders'
import { addDays, dateRange } from './date'
import type { AppData, PrayerName, Reason } from './types'
import { PRAYERS } from './types'

export interface ReminderContext {
  /** Missed prayers over the last 7 days, counting only days the user logged anything. */
  missed: number
  late: number
  /** Prayers marked missed (all time) that haven't been made up. */
  owed: number
  /** Consecutive recent days with all five prayed. */
  streak: number
  recentReasons: Reason[]
  hour: number
  nextPrayer?: PrayerName
}

export function buildContext(data: AppData, today: string, now: Date, nextPrayer?: PrayerName): ReminderContext {
  let missed = 0
  let late = 0
  const recentReasons: Reason[] = []
  for (const date of dateRange(addDays(today, -7), addDays(today, -1))) {
    const day = data.logs[date]
    if (!day || Object.keys(day).length === 0) continue
    for (const p of PRAYERS) {
      const log = day[p]
      if (!log || log.status === 'missed') missed++
      else if (log.status === 'late' || log.status === 'qada') late++
      if (log?.reason && date >= addDays(today, -3)) recentReasons.push(log.reason)
    }
  }

  let owed = 0
  for (const day of Object.values(data.logs)) for (const p of PRAYERS) if (day[p]?.status === 'missed') owed++

  let streak = 0
  for (let d = addDays(today, -1); ; d = addDays(d, -1)) {
    const day = data.logs[d]
    const ok = PRAYERS.every((p) => day?.[p] && ['on_time', 'late', 'qada', 'excused'].includes(day[p]!.status))
    if (!ok) break
    streak++
  }

  return { missed, late, owed, streak, recentReasons, hour: now.getHours(), nextPrayer }
}

/**
 * Chooses which kind of reminder fits. When someone is struggling, lead with mercy
 * and hope rather than warnings, mixing in the importance of prayer.
 */
export function chooseTag(ctx: ReminderContext, daySeed: number): ReminderTag {
  const alternate = (tags: ReminderTag[]) => tags[daySeed % tags.length]

  if (ctx.recentReasons.some((r) => r === 'illness' || r === 'travel')) return 'hardship'
  if (ctx.missed >= 5) return alternate(['forgiveness', 'importance', 'forgiveness', ctx.owed ? 'qada' : 'on_time'])
  if (ctx.missed >= 1) return alternate(ctx.owed ? ['qada', 'forgiveness'] : ['forgiveness', 'importance'])
  if (ctx.late >= 3) return alternate(['on_time', 'importance'])
  if (ctx.streak >= 3) return alternate(['consistency', 'sunnah', 'jamaah'])

  if (ctx.hour >= 0 && ctx.hour < 4) return 'night'
  if (ctx.nextPrayer === 'fajr' || ctx.nextPrayer === 'asr' || ctx.nextPrayer === 'isha') {
    return alternate([ctx.nextPrayer, 'general'])
  }
  return alternate(['general', 'jamaah', 'sunnah', 'consistency'])
}

function hash(s: string): number {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

/** Stable for the whole day, so the reminder doesn't change on every render. */
export function pickReminder(tag: ReminderTag, seed: string, maxLength = Infinity): Reminder {
  const all = remindersFor(tag)
  const short = all.filter((r) => r.text.length <= maxLength)
  const pool = short.length ? short : all
  return pool[hash(`${seed}:${tag}`) % pool.length]
}

export function reminderFor(data: AppData, today: string, now: Date, nextPrayer?: PrayerName): {
  tag: ReminderTag
  reminder: Reminder
  context: ReminderContext
} {
  const context = buildContext(data, today, now, nextPrayer)
  const tag = chooseTag(context, hash(today))
  return { tag, reminder: pickReminder(tag, today), context }
}

export const TAG_HEADINGS: Record<ReminderTag, string> = {
  importance: 'The weight of prayer',
  forgiveness: 'Allah’s mercy is vast',
  qada: 'It’s never too late to make up',
  on_time: 'Prayer at its time',
  consistency: 'Keep going',
  hardship: 'Allah knows your situation',
  fajr: 'The dawn prayer',
  asr: 'Guard the Asr',
  isha: 'The night prayer',
  jamaah: 'Pray together',
  sunnah: 'The extra prayers',
  night: 'The last third of the night',
  general: 'A reminder',
}
