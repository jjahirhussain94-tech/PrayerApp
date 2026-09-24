import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { useRef, useState } from 'react'
import { notificationsSupported, requestPermission } from '../lib/notifications'
import { METHOD_LABELS } from '../lib/prayerTimes'
import { normalize } from '../lib/storage'
import { dateKey } from '../lib/date'
import type { AppData, MethodKey, ReminderSettings, Settings } from '../lib/types'

interface Props {
  data: AppData
  updateSettings: (patch: Partial<Settings>) => void
  replaceData: (data: AppData) => void
}

export function SettingsView({ data, updateSettings, replaceData }: Props) {
  const { settings } = data
  const [lat, setLat] = useState(settings.location?.latitude.toString() ?? '')
  const [lng, setLng] = useState(settings.location?.longitude.toString() ?? '')
  const [label, setLabel] = useState(settings.location?.label ?? '')
  const [message, setMessage] = useState('')
  const [locating, setLocating] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const [reminderMessage, setReminderMessage] = useState('')
  const reminders = settings.reminders
  const setReminders = (patch: Partial<ReminderSettings>) => updateSettings({ reminders: { ...reminders, ...patch } })

  const toggleReminders = async (enabled: boolean) => {
    if (enabled && !(await requestPermission())) {
      setReminderMessage('Notifications are turned off for Salah Tracker. Allow them in iOS Settings → Notifications.')
      return
    }
    setReminderMessage('')
    setReminders({ enabled })
  }

  const applyPosition = (latitude: number, longitude: number) => {
    const la = +latitude.toFixed(4)
    const lo = +longitude.toFixed(4)
    setLat(String(la))
    setLng(String(lo))
    updateSettings({ location: { latitude: la, longitude: lo, label: label || undefined } })
    setMessage('Location updated.')
  }

  const locateMe = async () => {
    setLocating(true)
    try {
      if (Capacitor.isNativePlatform()) {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000 })
        applyPosition(pos.coords.latitude, pos.coords.longitude)
      } else {
        if (!navigator.geolocation) throw new Error('location is not available in this browser')
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 15000 }),
        )
        applyPosition(pos.coords.latitude, pos.coords.longitude)
      }
    } catch (err) {
      setMessage(`Couldn't get your location: ${(err as Error).message}. Enter coordinates below instead.`)
    } finally {
      setLocating(false)
    }
  }

  const saveManual = () => {
    const la = Number(lat)
    const lo = Number(lng)
    if (!lat || !lng || !(Math.abs(la) <= 90) || !(Math.abs(lo) <= 180)) {
      return setMessage('Latitude must be between -90 and 90, longitude between -180 and 180.')
    }
    updateSettings({ location: { latitude: la, longitude: lo, label: label.trim() || undefined } })
    setMessage('Location saved.')
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `prayer-tracker-${dateKey(new Date())}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = async (file: File) => {
    try {
      replaceData(normalize(JSON.parse(await file.text())))
      setMessage('Backup restored.')
    } catch (e) {
      setMessage(`Import failed: ${(e as Error).message}`)
    }
  }

  return (
    <section>
      <div className="card">
        <h2>Location</h2>
        <p className="muted small">Prayer times are calculated on your device from your coordinates.</p>
        <button className="primary" onClick={() => void locateMe()} disabled={locating}>
          {locating ? 'Locating…' : '📍 Use my current location'}
        </button>
        <div className="form-grid">
          <label>
            Latitude
            <input inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="51.5074" />
          </label>
          <label>
            Longitude
            <input inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-0.1278" />
          </label>
          <label className="span-2">
            Place name (optional)
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="London" />
          </label>
        </div>
        <button onClick={saveManual}>Save location</button>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="card">
        <h2>Reminders</h2>
        {notificationsSupported() ? (
          <>
            <label className="check">
              <input type="checkbox" checked={reminders.enabled} onChange={(e) => void toggleReminders(e.target.checked)} />
              Prayer reminders
            </label>
            {reminders.enabled && (
              <>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={reminders.atStart}
                    onChange={(e) => setReminders({ atStart: e.target.checked })}
                  />
                  Notify when each prayer time begins
                </label>
                <label>
                  Nudge if a prayer isn’t logged
                  <select
                    value={reminders.nudgeMinutes}
                    onChange={(e) => setReminders({ nudgeMinutes: Number(e.target.value) })}
                  >
                    <option value={0}>Off</option>
                    <option value={15}>15 minutes before its time ends</option>
                    <option value={30}>30 minutes before its time ends</option>
                    <option value={60}>1 hour before its time ends</option>
                  </select>
                </label>
                <label className="check">
                  <input type="checkbox" checked={reminders.hadith} onChange={(e) => setReminders({ hadith: e.target.checked })} />
                  Include a hadith or ayah
                </label>
                {!settings.location && <p className="message">Set your location above so reminders can be scheduled.</p>}
              </>
            )}
            {reminderMessage && <p className="message">{reminderMessage}</p>}
          </>
        ) : (
          <p className="muted small">Reminders are available in the iPhone app.</p>
        )}
      </div>

      <div className="card">
        <h2>Calculation</h2>
        <label>
          Method
          <select value={settings.method} onChange={(e) => updateSettings({ method: e.target.value as MethodKey })}>
            {Object.entries(METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Asr calculation
          <select
            value={settings.madhab}
            onChange={(e) => updateSettings({ madhab: e.target.value as Settings['madhab'] })}
          >
            <option value="shafi">Standard (Shafi'i, Maliki, Hanbali)</option>
            <option value="hanafi">Hanafi</option>
          </select>
        </label>
      </div>

      <div className="card">
        <h2>Your data</h2>
        <p className="muted small">Everything is stored in this browser only. Export a backup to move it to another device.</p>
        <div className="row wrap">
          <button onClick={exportData}>Export backup</button>
          <button onClick={() => fileInput.current?.click()}>Import backup</button>
          <button
            className="danger"
            onClick={() => {
              if (confirm('Delete all prayer logs? This cannot be undone.')) {
                replaceData({ ...data, logs: {} })
                setMessage('All logs deleted.')
              }
            }}
          >
            Delete all logs
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) importData(f)
            e.target.value = ''
          }}
        />
      </div>
    </section>
  )
}
