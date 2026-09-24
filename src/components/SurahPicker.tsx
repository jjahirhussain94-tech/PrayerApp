import { useEffect, useMemo, useRef, useState } from 'react'
import { SURAHS } from '../data/surahs'

// Short surahs most commonly recited in daily prayers, shown first for quick access.
const QUICK = [112, 113, 114, 108, 103, 110, 109, 105, 106, 97, 95]

interface Props {
  onPick: (surah: number) => void
  onClose: () => void
}

export function SurahPicker({ onPick, onClose }: Props) {
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/['\-\s]/g, '')
    if (!q) return [...QUICK.map((n) => SURAHS[n - 1]), ...SURAHS.filter((s) => !QUICK.includes(s.number))]
    return SURAHS.filter(
      (s) =>
        String(s.number) === q ||
        s.name.toLowerCase().replace(/['\-\s]/g, '').includes(q) ||
        s.english.toLowerCase().replace(/['\-\s]/g, '').includes(q),
    )
  }, [query])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-label="Choose a surah" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <input
            ref={input}
            type="search"
            placeholder="Search by name or number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && results[0] && onPick(results[0].number)}
          />
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <ul className="surah-list">
          {results.map((s) => (
            <li key={s.number}>
              <button onClick={() => onPick(s.number)}>
                <span className="surah-num">{s.number}</span>
                <span className="surah-name">
                  {s.name}
                  <small>{s.english}</small>
                </span>
                <span className="muted small">{s.ayahs} ayahs</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="muted empty">No surah matches “{query}”</li>}
        </ul>
      </div>
    </div>
  )
}
