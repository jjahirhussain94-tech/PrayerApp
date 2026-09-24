import { useState } from 'react'
import { getSurah } from '../data/surahs'
import { formatTime } from '../lib/date'
import type { PrayerLog, PrayerName, PrayerStatus, Reason } from '../lib/types'
import { PRAYER_LABELS, REASON_LABELS, STATUS_LABELS } from '../lib/types'
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

const STATUSES: PrayerStatus[] = ['on_time', 'late', 'qada', 'missed', 'excused']
const REASONS = Object.keys(REASON_LABELS) as Reason[]

/** ISO string → value for <input type="datetime-local"> in local time. */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function PrayerCard({ prayer, time, log, isNext, notYet, suggest, onChange }: Props) {
  const [picking, setPicking] = useState(false)
  const update = (patch: Partial<PrayerLog>) => {
    const next: PrayerLog = { status: 'on_time', jamaah: false, surahs: [], ...log, ...patch, loggedAt: new Date().toISOString() }
    // Late and qada prayers remember when they were actually offered; default to now.
    if ((next.status === 'late' || next.status === 'qada') && !next.prayedAt) next.prayedAt = new Date().toISOString()
    if (next.status === 'on_time' || next.status === 'excused') {
      delete next.prayedAt
      delete next.reason
    }
    if (next.status === 'missed') delete next.prayedAt
    onChange(next)
  }

  const prayed = log && (log.status === 'on_time' || log.status === 'late' || log.status === 'qada')
  const needsReason = log && (log.status === 'late' || log.status === 'qada' || log.status === 'missed')

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
          <div className="segmented five" role="radiogroup" aria-label="Status">
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

          {(log.status === 'late' || log.status === 'qada') && log.prayedAt && (
            <label className="inline-field">
              Prayed at
              <input
                type="datetime-local"
                value={toLocalInput(log.prayedAt)}
                onChange={(e) => e.target.value && update({ prayedAt: new Date(e.target.value).toISOString() })}
              />
            </label>
          )}

          {needsReason && (
            <div>
              <span className="muted small">{log.status === 'missed' ? 'Why was it missed?' : 'What made it late?'}</span>
              <div className="chips">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    className={`chip choice${log.reason === r ? ' selected' : ''}`}
                    aria-pressed={log.reason === r}
                    onClick={() => update({ reason: log.reason === r ? undefined : r })}
                  >
                    {REASON_LABELS[r]}
                  </button>
                ))}
              </div>
              <input
                className="note"
                placeholder="Add a note (optional)"
                value={log.note ?? ''}
                onChange={(e) => update({ note: e.target.value || undefined })}
              />
            </div>
          )}

          {log.status === 'missed' && (
            <button className="small" onClick={() => update({ status: 'qada', prayedAt: new Date().toISOString() })}>
              I’ve made it up now
            </button>
          )}

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
