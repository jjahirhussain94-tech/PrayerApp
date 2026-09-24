export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type PrayerName = (typeof PRAYERS)[number]

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

/** on_time: within the prayer's window. late: after it. qada: made up on a later day. */
export type PrayerStatus = 'on_time' | 'late' | 'qada' | 'missed'

export const STATUS_LABELS: Record<PrayerStatus, string> = {
  on_time: 'On time',
  late: 'Late',
  qada: 'Qada',
  missed: 'Missed',
}

export interface PrayerLog {
  status: PrayerStatus
  jamaah: boolean
  /** Surah numbers recited, in order. */
  surahs: number[]
  loggedAt: string
}

export type DayLog = Partial<Record<PrayerName, PrayerLog>>

export type MethodKey =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'

export interface Location {
  latitude: number
  longitude: number
  label?: string
}

export interface Settings {
  location?: Location
  method: MethodKey
  madhab: 'shafi' | 'hanafi'
}

export interface AppData {
  version: 1
  /** Keyed by local date, YYYY-MM-DD. */
  logs: Record<string, DayLog>
  settings: Settings
}
