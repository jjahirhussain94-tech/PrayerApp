import { describe, expect, it } from 'vitest'
import { computeTimes, duePrayers, nextPrayer, qiblaDirection, suggestStatus } from './prayerTimes'
import type { Settings } from './types'

const settings: Settings = {
  location: { latitude: 51.5074, longitude: -0.1278 },
  method: 'MuslimWorldLeague',
  madhab: 'shafi',
  reminders: { enabled: true, atStart: true, nudgeMinutes: 30, hadith: true },
}

describe('prayer times', () => {
  it('orders the day correctly', () => {
    const t = computeTimes('2026-03-20', settings)!
    expect(t.fajr < t.sunrise && t.sunrise < t.dhuhr && t.dhuhr < t.asr).toBe(true)
    expect(t.asr < t.maghrib && t.maghrib < t.isha).toBe(true)
  })

  it('returns null without a location', () => {
    expect(computeTimes('2026-03-20', { ...settings, location: undefined })).toBeNull()
  })

  it('suggests status from the prayer window', () => {
    const t = computeTimes('2026-03-20', settings)!
    const inWindow = new Date(t.dhuhr.getTime() + 60_000)
    const afterWindow = new Date(t.asr.getTime() + 60_000)
    expect(suggestStatus('dhuhr', '2026-03-20', settings, inWindow)).toBe('on_time')
    expect(suggestStatus('dhuhr', '2026-03-20', settings, afterWindow)).toBe('late')
    expect(suggestStatus('dhuhr', '2026-03-20', settings, new Date(2026, 2, 25))).toBe('qada')
  })

  it('finds due and next prayers', () => {
    const t = computeTimes('2026-03-20', settings)!
    const afterAsr = new Date(t.asr.getTime() + 60_000)
    expect(duePrayers('2026-03-20', settings, afterAsr)).toEqual(['fajr', 'dhuhr', 'asr'])
    expect(nextPrayer('2026-03-20', settings, afterAsr)?.prayer).toBe('maghrib')
    const late = new Date(t.isha.getTime() + 60_000)
    expect(nextPrayer('2026-03-20', settings, late)?.prayer).toBe('fajr')
  })

  it('points London roughly south-east to Makkah', () => {
    expect(qiblaDirection(settings.location!)).toBeGreaterThan(110)
    expect(qiblaDirection(settings.location!)).toBeLessThan(125)
  })
})
