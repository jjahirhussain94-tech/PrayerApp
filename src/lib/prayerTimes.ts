import { CalculationMethod, Coordinates, Madhab, PrayerTimes, Qibla } from 'adhan'
import { addDays, parseKey } from './date'
import type { Location, MethodKey, PrayerName, PrayerStatus, Settings } from './types'
import { PRAYERS } from './types'

export const METHOD_LABELS: Record<MethodKey, string> = {
  MuslimWorldLeague: 'Muslim World League',
  Egyptian: 'Egyptian General Authority',
  Karachi: 'University of Islamic Sciences, Karachi',
  UmmAlQura: 'Umm al-Qura, Makkah',
  Dubai: 'Dubai',
  MoonsightingCommittee: 'Moonsighting Committee',
  NorthAmerica: 'ISNA (North America)',
  Kuwait: 'Kuwait',
  Qatar: 'Qatar',
  Singapore: 'Singapore',
  Tehran: 'Tehran',
  Turkey: 'Diyanet (Turkey)',
}

export interface DayTimes {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export function computeTimes(key: string, settings: Settings): DayTimes | null {
  if (!settings.location) return null
  const { latitude, longitude } = settings.location
  const params = CalculationMethod[settings.method]()
  params.madhab = settings.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  const t = new PrayerTimes(new Coordinates(latitude, longitude), parseKey(key), params)
  return { fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr, asr: t.asr, maghrib: t.maghrib, isha: t.isha }
}

/** When each prayer's window closes. */
export function windowEnd(prayer: PrayerName, key: string, settings: Settings): Date | null {
  const t = computeTimes(key, settings)
  if (!t) return null
  switch (prayer) {
    case 'fajr':
      return t.sunrise
    case 'dhuhr':
      return t.asr
    case 'asr':
      return t.maghrib
    case 'maghrib':
      return t.isha
    case 'isha':
      return computeTimes(addDays(key, 1), settings)!.fajr
  }
}

/** Best guess at a status when marking a prayer as prayed right now. */
export function suggestStatus(prayer: PrayerName, key: string, settings: Settings, now = new Date()): PrayerStatus {
  const end = windowEnd(prayer, key, settings)
  if (end && now > end) {
    const sameDayOrNext = now < parseKey(addDays(key, 2))
    return sameDayOrNext ? 'late' : 'qada'
  }
  return 'on_time'
}

/** Prayers of a day whose time has begun (all of them for a past day). */
export function duePrayers(key: string, settings: Settings, now = new Date()): PrayerName[] {
  const t = computeTimes(key, settings)
  if (!t) return [...PRAYERS]
  return PRAYERS.filter((p) => t[p] <= now)
}

export function nextPrayer(
  todayKey: string,
  settings: Settings,
  now = new Date(),
): { prayer: PrayerName; at: Date } | null {
  const today = computeTimes(todayKey, settings)
  if (!today) return null
  for (const p of PRAYERS) if (today[p] > now) return { prayer: p, at: today[p] }
  return { prayer: 'fajr', at: computeTimes(addDays(todayKey, 1), settings)!.fajr }
}

export function qiblaDirection(loc: Location): number {
  return Qibla(new Coordinates(loc.latitude, loc.longitude))
}
