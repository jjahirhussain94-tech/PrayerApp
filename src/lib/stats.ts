import { getSurah } from '../data/surahs'
import { dateRange } from './date'
import type { DayLog, PrayerName, PrayerStatus } from './types'
import { PRAYERS } from './types'

export interface PrayerBreakdown {
  due: number
  on_time: number
  late: number
  qada: number
  missed: number
  jamaah: number
}

export interface DayPoint {
  date: string
  prayed: number
  due: number
}

export interface Stats {
  days: number
  breakdown: PrayerBreakdown
  perPrayer: Record<PrayerName, PrayerBreakdown>
  prayed: number
  completionRate: number
  onTimeRate: number
  jamaahRate: number
  currentStreak: number
  bestStreak: number
  daily: DayPoint[]
  surahCounts: { surah: number; count: number }[]
  totalRecitations: number
  uniqueSurahs: number
  ayahsRecited: number
}

function emptyBreakdown(): PrayerBreakdown {
  return { due: 0, on_time: 0, late: 0, qada: 0, missed: 0, jamaah: 0 }
}

function isPrayed(status: PrayerStatus | undefined): boolean {
  return status !== undefined && status !== 'missed'
}

/**
 * Stats over [start, end]. Unlogged prayers on days that are due count as missed.
 * `dueOnEnd` lists which prayers have begun on the last day (usually today), so an
 * afternoon view doesn't count Isha as missed yet.
 */
export function computeStats(
  logs: Record<string, DayLog>,
  start: string,
  end: string,
  dueOnEnd: readonly PrayerName[] = PRAYERS,
): Stats {
  const breakdown = emptyBreakdown()
  const perPrayer = Object.fromEntries(PRAYERS.map((p) => [p, emptyBreakdown()])) as Record<
    PrayerName,
    PrayerBreakdown
  >
  const surahMap = new Map<number, number>()
  const daily: DayPoint[] = []
  const dates = dateRange(start, end)

  for (const date of dates) {
    const day = logs[date] ?? {}
    const due = date === end ? PRAYERS.filter((p) => dueOnEnd.includes(p) || day[p]) : PRAYERS
    let prayedToday = 0
    for (const p of due) {
      const log = day[p]
      const status: PrayerStatus = log?.status ?? 'missed'
      for (const b of [breakdown, perPrayer[p]]) {
        b.due++
        b[status]++
        if (log?.jamaah && isPrayed(status)) b.jamaah++
      }
      if (isPrayed(status)) prayedToday++
      for (const s of log?.surahs ?? []) surahMap.set(s, (surahMap.get(s) ?? 0) + 1)
    }
    daily.push({ date, prayed: prayedToday, due: due.length })
  }

  // A day counts toward a streak when all five are prayed. Today doesn't break a
  // streak while it is still incomplete.
  const complete = dates.map((d) => PRAYERS.every((p) => isPrayed(logs[d]?.[p]?.status)))
  let bestStreak = 0
  let run = 0
  for (const c of complete) {
    run = c ? run + 1 : 0
    bestStreak = Math.max(bestStreak, run)
  }
  let currentStreak = 0
  for (let i = complete.length - 1; i >= 0; i--) {
    if (complete[i]) currentStreak++
    else if (i === complete.length - 1) continue
    else break
  }

  const prayed = breakdown.on_time + breakdown.late + breakdown.qada
  const surahCounts = [...surahMap.entries()]
    .map(([surah, count]) => ({ surah, count }))
    .sort((a, b) => b.count - a.count || a.surah - b.surah)
  const totalRecitations = surahCounts.reduce((n, s) => n + s.count, 0)

  return {
    days: dates.length,
    breakdown,
    perPrayer,
    prayed,
    completionRate: breakdown.due ? prayed / breakdown.due : 0,
    onTimeRate: prayed ? breakdown.on_time / prayed : 0,
    jamaahRate: prayed ? breakdown.jamaah / prayed : 0,
    currentStreak,
    bestStreak,
    daily,
    surahCounts,
    totalRecitations,
    uniqueSurahs: surahCounts.length,
    ayahsRecited: surahCounts.reduce((n, s) => n + s.count * (getSurah(s.surah)?.ayahs ?? 0), 0),
  }
}

/** Earliest logged date, for "all time" ranges. */
export function firstLoggedDate(logs: Record<string, DayLog>): string | undefined {
  return Object.keys(logs)
    .filter((k) => Object.keys(logs[k]).length > 0)
    .sort()[0]
}
