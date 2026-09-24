import { describe, expect, it } from 'vitest'
import { REMINDERS } from '../data/reminders'
import { buildContext, chooseTag, pickReminder, type ReminderContext } from './encouragement'
import { defaultData } from './storage'
import type { PrayerLog } from './types'

const base: ReminderContext = { missed: 0, late: 0, owed: 0, streak: 0, recentReasons: [], hour: 12 }
const log = (status: PrayerLog['status'], reason?: PrayerLog['reason']): PrayerLog => ({
  status,
  jamaah: false,
  surahs: [],
  loggedAt: '',
  reason,
})

describe('chooseTag', () => {
  it('leads with mercy when many prayers are missed', () => {
    expect(chooseTag({ ...base, missed: 8 }, 0)).toBe('forgiveness')
    expect(chooseTag({ ...base, missed: 8 }, 1)).toBe('importance')
  })

  it('suggests making up prayers when some are owed', () => {
    expect(chooseTag({ ...base, missed: 2, owed: 2 }, 0)).toBe('qada')
  })

  it('is gentle during illness or travel', () => {
    expect(chooseTag({ ...base, missed: 8, recentReasons: ['illness'] }, 0)).toBe('hardship')
  })

  it('encourages consistency on a streak', () => {
    expect(chooseTag({ ...base, streak: 5 }, 0)).toBe('consistency')
  })

  it('uses the time of day otherwise', () => {
    expect(chooseTag({ ...base, hour: 2 }, 0)).toBe('night')
    expect(chooseTag({ ...base, nextPrayer: 'asr' }, 0)).toBe('asr')
  })
})

describe('buildContext', () => {
  it('counts missed and late only on days with activity, plus owed and streak', () => {
    const d = defaultData()
    d.logs['2026-03-19'] = { fajr: log('missed', 'slept'), dhuhr: log('late'), asr: log('on_time'), maghrib: log('on_time'), isha: log('on_time') }
    const ctx = buildContext(d, '2026-03-20', new Date(2026, 2, 20, 12))
    expect(ctx.missed).toBe(1)
    expect(ctx.late).toBe(1)
    expect(ctx.owed).toBe(1)
    expect(ctx.recentReasons).toEqual(['slept'])
    expect(ctx.streak).toBe(0)
  })
})

describe('reminders', () => {
  it('every tag used by the chooser has content, and picks are stable', () => {
    for (const tag of ['importance', 'forgiveness', 'qada', 'on_time', 'consistency', 'hardship', 'night', 'general', 'jamaah', 'sunnah', 'fajr', 'asr', 'isha'] as const) {
      expect(REMINDERS.some((r) => r.tags.includes(tag))).toBe(true)
    }
    expect(pickReminder('forgiveness', '2026-03-20')).toBe(pickReminder('forgiveness', '2026-03-20'))
  })

  it('respects the length cap when possible', () => {
    expect(pickReminder('forgiveness', 'x', 120).text.length).toBeLessThanOrEqual(120)
  })
})
