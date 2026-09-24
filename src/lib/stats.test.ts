import { describe, expect, it } from 'vitest'
import { computeStats } from './stats'
import type { DayLog, PrayerLog, PrayerStatus } from './types'

const log = (status: PrayerStatus, surahs: number[] = [], jamaah = false): PrayerLog => ({
  status,
  jamaah,
  surahs,
  loggedAt: '2026-01-01T00:00:00Z',
})

const full = (status: PrayerStatus = 'on_time'): DayLog => ({
  fajr: log(status),
  dhuhr: log(status),
  asr: log(status),
  maghrib: log(status),
  isha: log(status),
})

describe('computeStats', () => {
  it('counts unlogged due prayers as missed', () => {
    const s = computeStats({ '2026-01-01': { fajr: log('on_time') } }, '2026-01-01', '2026-01-02')
    expect(s.breakdown.due).toBe(10)
    expect(s.prayed).toBe(1)
    expect(s.breakdown.missed).toBe(9)
    expect(s.completionRate).toBeCloseTo(0.1)
  })

  it('only counts prayers that have begun on the last day', () => {
    const s = computeStats({ '2026-01-01': { fajr: log('on_time') } }, '2026-01-01', '2026-01-01', [
      'fajr',
      'dhuhr',
    ])
    expect(s.breakdown.due).toBe(2)
    expect(s.breakdown.missed).toBe(1)
  })

  it('computes on-time and jamaah rates over prayed prayers', () => {
    const day: DayLog = {
      fajr: log('on_time', [], true),
      dhuhr: log('late'),
      asr: log('qada'),
      maghrib: log('missed', [], true),
    }
    const s = computeStats({ '2026-01-01': day }, '2026-01-01', '2026-01-01')
    expect(s.prayed).toBe(3)
    expect(s.onTimeRate).toBeCloseTo(1 / 3)
    expect(s.jamaahRate).toBeCloseTo(1 / 3)
    expect(s.perPrayer.isha.missed).toBe(1)
  })

  it('tracks current and best streaks, not breaking on an incomplete last day', () => {
    const logs = {
      '2026-01-01': full(),
      '2026-01-02': full(),
      '2026-01-03': full(),
      '2026-01-04': {},
      '2026-01-05': full('late'),
      '2026-01-06': full(),
      '2026-01-07': { fajr: log('on_time') },
    }
    const s = computeStats(logs, '2026-01-01', '2026-01-07', ['fajr'])
    expect(s.bestStreak).toBe(3)
    expect(s.currentStreak).toBe(2)
  })

  it('tallies surahs and ayahs', () => {
    const logs = {
      '2026-01-01': { fajr: log('on_time', [1, 112]), dhuhr: log('on_time', [1, 114]) },
    }
    const s = computeStats(logs, '2026-01-01', '2026-01-01', ['fajr', 'dhuhr'])
    expect(s.surahCounts[0]).toEqual({ surah: 1, count: 2 })
    expect(s.uniqueSurahs).toBe(3)
    expect(s.totalRecitations).toBe(4)
    expect(s.ayahsRecited).toBe(7 * 2 + 4 + 6)
  })
})
