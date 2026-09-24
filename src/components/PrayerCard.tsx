import { useState } from 'react'
import { getSurah } from '../data/surahs'
import { formatTime } from '../lib/date'
import type { PrayerLog, PrayerName, PrayerStatus } from '../lib/types'
import { PRAYER_LABELS, STATUS_LABELS } from '../lib/types'
import { SurahPicker } from './SurahPicker'

interface Props {
  prayer: PrayerName
  time?: Date
  log?: PrayerLog
  isNext?: boolean
  notYet?: boolean
  suggest: () => PrayerStatus
  onChange: (log: PrayerLog | undefined) => void
}

const STATUSES: PrayerStatus[] = ['on_time', 'late', 'qada', 'missed']

export function PrayerCard({ prayer, time, log, isNext, notYet, suggest, onChange }: Props) {
  const [picking, setPicking] = useState(false)
  const update = (patch: Partial<PrayerLog>) =>
    onChange({ status: 'on_time', jamaah: false, surahs: [], ...log, ...patch, loggedAt: new Date().toISOString() })

  const prayed = log && log.status !== 'missed'

  return (
    <article className={`prayer-card${isNext ? ' next' : ''}${prayed ? ' done' : ''}`}>
      <header>
        <div>
          <h3>{PRAYER_LABELS[prayer]}</h3>
          {time && <span className="muted">{formatTime(time)}</span>}
          {isNext && <span className="badge">Next</span>}
        </div>
        {log ? (
          <button className="ghost small" onClick={() => onChange(undefined)} aria-label={`Clear ${prayer}`}>
            Clear
          </button>
        ) : (
          <div className="row">
            <button className="ghost" onClick={() => update({ status: 'missed' })} disabled={notYet}>
              Missed
            </button>
            <button className="primary" onClick={() => update({ status: suggest() })} disabled={notYet}>
              ✓ Prayed
            </button>
          </div>
        )}
      </header>

      {log && (
        <div className="prayer-body">
          <div className="segmented" role="radiogroup" aria-label="Status">
            {STATUSES.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={log.status === s}
                className={`status-${s}${log.status === s ? ' active' : ''}`}
                onClick={() => update({ status: s })}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {prayed && (
            <>
              <label className="check">
                <input type="checkbox" checked={log.jamaah} onChange={(e) => update({ jamaah: e.target.checked })} />
                Prayed in congregation (jama'ah)
              </label>
              <div className="surahs">
                <span className="muted small">Surahs recited after Al-Fatihah</span>
                <div className="chips">
                  {log.surahs.map((n, i) => (
                    <span className="chip" key={`${n}-${i}`}>
                      {n}. {getSurah(n)?.name}
                      <button
                        aria-label={`Remove ${getSurah(n)?.name}`}
                        onClick={() => update({ surahs: log.surahs.filter((_, j) => j !== i) })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button className="chip add" onClick={() => setPicking(true)}>
                    + Add surah
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {picking && (
        <SurahPicker
          onClose={() => setPicking(false)}
          onPick={(n) => {
            update({ surahs: [...(log?.surahs ?? []), n] })
            setPicking(false)
          }}
        />
      )}
    </article>
  )
}
