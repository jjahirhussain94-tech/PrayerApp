import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { AppData } from './types'

const KEY = 'prayer-tracker:v1'

export function defaultData(): AppData {
  return {
    version: 1,
    logs: {},
    extras: {},
    settings: {
      method: 'MuslimWorldLeague',
      madhab: 'shafi',
      reminders: { enabled: false, atStart: true, nudgeMinutes: 30, hadith: true },
    },
  }
}

/** Synchronous load from localStorage, used for the first render. */
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultData()
    return normalize(JSON.parse(raw))
  } catch {
    return defaultData()
  }
}

/**
 * iOS can clear a web view's localStorage when storage runs low, so the native app
 * also keeps a copy in Preferences (UserDefaults) and prefers it on launch.
 */
export async function loadNativeData(): Promise<AppData | null> {
  if (!Capacitor.isNativePlatform()) return null
  try {
    const { value } = await Preferences.get({ key: KEY })
    return value ? normalize(JSON.parse(value)) : null
  } catch {
    return null
  }
}

export function saveData(data: AppData): void {
  const json = JSON.stringify(data)
  try {
    localStorage.setItem(KEY, json)
  } catch {
    // Storage full or unavailable; the in-memory state still works for this session.
  }
  if (Capacitor.isNativePlatform()) void Preferences.set({ key: KEY, value: json })
}

/** Validates imported/stored JSON, filling defaults. Throws on unusable input. */
export function normalize(input: unknown): AppData {
  if (!input || typeof input !== 'object') throw new Error('Not a prayer tracker backup')
  const obj = input as Partial<AppData>
  if (!obj.logs || typeof obj.logs !== 'object') throw new Error('Backup has no logs')
  const base = defaultData()
  return {
    version: 1,
    logs: obj.logs,
    extras: obj.extras && typeof obj.extras === 'object' ? obj.extras : {},
    settings: {
      ...base.settings,
      ...obj.settings,
      reminders: { ...base.settings.reminders, ...obj.settings?.reminders },
    },
  }
}
