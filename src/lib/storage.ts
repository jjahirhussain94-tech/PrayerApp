import type { AppData } from './types'

const KEY = 'prayer-tracker:v1'

export function defaultData(): AppData {
  return { version: 1, logs: {}, settings: { method: 'MuslimWorldLeague', madhab: 'shafi' } }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultData()
    return normalize(JSON.parse(raw))
  } catch {
    return defaultData()
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable; the in-memory state still works for this session.
  }
}

/** Validates imported/stored JSON, filling defaults. Throws on unusable input. */
export function normalize(input: unknown): AppData {
  if (!input || typeof input !== 'object') throw new Error('Not a prayer tracker backup')
  const obj = input as Partial<AppData>
  if (!obj.logs || typeof obj.logs !== 'object') throw new Error('Backup has no logs')
  const base = defaultData()
  return { version: 1, logs: obj.logs, settings: { ...base.settings, ...obj.settings } }
}
