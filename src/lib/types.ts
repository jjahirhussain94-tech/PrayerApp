export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type PrayerName = (typeof PRAYERS)[number]

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

/**
 * on_time: within the prayer's window. late: after it. qada: made up on a later day.
 * excused: not required (e.g. menstruation), so it doesn't count toward stats.
 */
export type PrayerStatus = 'on_time' | 'late' | 'qada' | 'missed' | 'excused'

export const STATUS_LABELS: Record<PrayerStatus, string> = {
  on_time: 'On time',
  late: 'Late',
  qada: 'Qada',
  missed: 'Missed',
  excused: 'Excused',
}

export type Reason = 'slept' | 'work' | 'study' | 'travel' | 'illness' | 'forgot' | 'busy' | 'lazy' | 'other'

export const REASON_LABELS: Record<Reason, string> = {
  slept: 'Overslept',
  work: 'Work',
  study: 'Study',
  travel: 'Travelling',
  illness: 'Illness',
  forgot: 'Forgot',
  busy: 'Busy / distracted',
  lazy: 'Low motivation',
  other: 'Other',
}

export interface PrayerLog {
  status: PrayerStatus
  jamaah: boolean
  /** Surah numbers recited, in order. */
  surahs: number[]
  loggedAt: string
  /** When the prayer was actually offered (ISO), for late and qada prayers. */
  prayedAt?: string
  /** Why the prayer was late or missed. */
  reason?: Reason
  note?: string
}

export const EXTRAS = [
  'sunnah_fajr',
  'sunnah_dhuhr_before',
  'sunnah_dhuhr_after',
  'sunnah_maghrib',
  'sunnah_isha',
  'duha',
  'witr',
  'tahajjud',
] as const
export type ExtraPrayer = (typeof EXTRAS)[number]

export const EXTRA_INFO: Record<ExtraPrayer, { label: string; rakahs?: number; rawatib?: boolean }> = {
  sunnah_fajr: { label: '2 before Fajr', rakahs: 2, rawatib: true },
  sunnah_dhuhr_before: { label: '4 before Dhuhr', rakahs: 4, rawatib: true },
  sunnah_dhuhr_after: { label: '2 after Dhuhr', rakahs: 2, rawatib: true },
  sunnah_maghrib: { label: '2 after Maghrib', rakahs: 2, rawatib: true },
  sunnah_isha: { label: '2 after Isha', rakahs: 2, rawatib: true },
  duha: { label: 'Duha' },
  witr: { label: 'Witr' },
  tahajjud: { label: 'Tahajjud / Qiyam' },
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

export interface ReminderSettings {
  enabled: boolean
  /** Notify when each prayer's time begins. */
  atStart: boolean
  /** Minutes before a prayer's window ends to nudge if it isn't logged yet; 0 disables. */
  nudgeMinutes: number
  /** Include a hadith or ayah with reminders. */
  hadith: boolean
}

export interface Settings {
  location?: Location
  method: MethodKey
  madhab: 'shafi' | 'hanafi'
  reminders: ReminderSettings
}

export interface AppData {
  version: 1
  /** Keyed by local date, YYYY-MM-DD. */
  logs: Record<string, DayLog>
  /** Voluntary prayers offered, keyed by local date. */
  extras: Record<string, ExtraPrayer[]>
  settings: Settings
}
