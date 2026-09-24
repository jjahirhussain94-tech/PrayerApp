import { describe, expect, it } from 'vitest'
import { dateKey } from './date'
import { buildSchedule, notificationId } from './notifications'
import { computeTimes } from './prayerTimes'
import { defaultData } from './storage'
import type { AppData } from './types'

function data(patch: Partial<AppData['settings']['reminders']> = {}): AppData {
  const d = defaultData()
  d.settings.location = { latitude: 51.5074, longitude: -0.1278 }
  d.settings.reminders = { ...d.settings.reminders, enabled: true, ...patch }
  return d
}

describe('buildSchedule', () => {
  const now = new Date(2026, 2, 20, 5, 0)

  it('is empty when reminders are off or there is no location', () => {
    expect(buildSchedule({ ...data(), settings: { ...data().settings, location: undefined } }, now)).toEqual([])
    expect(buildSchedule(data({ enabled: false }), now)).toEqual([])
  })

  it('stays under the iOS pending limit and only schedules the future', () => {
    const s = buildSchedule(data(), now)
    expect(s.length).toBeGreaterThan(20)
    expect(s.length).toBeLessThanOrEqual(64)
    expect(s.every((n) => n.at > now)).toBe(true)
    expect(new Set(s.map((n) => n.id)).size).toBe(s.length)
  })

  it('skips the nudge for a prayer that is already logged', () => {
    const d = data()
    const today = dateKey(now)
    d.logs[today] = { dhuhr: { status: 'on_time', jamaah: false, surahs: [], loggedAt: '' } }
    const ids = buildSchedule(d, now).map((n) => n.id)
    expect(ids).not.toContain(notificationId(today, 'dhuhr', 'nudge'))
    expect(ids).toContain(notificationId(today, 'asr', 'nudge'))
    expect(ids).toContain(notificationId(today, 'dhuhr', 'start'))
  })

  it('places the nudge before the prayer window ends', () => {
    const today = dateKey(now)
    const t = computeTimes(today, data().settings)!
    const nudge = buildSchedule(data({ nudgeMinutes: 30 }), now).find(
      (n) => n.id === notificationId(today, 'asr', 'nudge'),
    )!
    expect(t.maghrib.getTime() - nudge.at.getTime()).toBe(30 * 60_000)
  })

  it('omits hadith text when turned off', () => {
    const s = buildSchedule(data({ hadith: false, nudgeMinutes: 0 }), now)
    expect(s.every((n) => n.body.startsWith('It’s time for'))).toBe(true)
  })
})
