import { useRef, useState } from 'react'
import { METHOD_LABELS } from '../lib/prayerTimes'
import { normalize } from '../lib/storage'
import { dateKey } from '../lib/date'
import type { AppData, MethodKey, Settings } from '../lib/types'

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

  const useMyLocation = () => {
    if (!navigator.geolocation) return setMessage('Location is not available in this browser.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = +pos.coords.latitude.toFixed(4)
        const lo = +pos.coords.longitude.toFixed(4)
        setLat(String(la))
        setLng(String(lo))
        updateSettings({ location: { latitude: la, longitude: lo, label: label || undefined } })
        setMessage('Location updated.')
        setLocating(false)
      },
      (err) => {
        setMessage(`Couldn't get your location: ${err.message}. Enter coordinates below instead.`)
        setLocating(false)
      },
    )
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
        <button className="primary" onClick={useMyLocation} disabled={locating}>
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
