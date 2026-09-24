import { reminderFor, TAG_HEADINGS } from '../lib/encouragement'
import type { AppData, PrayerName } from '../lib/types'

interface Props {
  data: AppData
  today: string
  now: Date
  nextPrayer?: PrayerName
}

export function ReminderCard({ data, today, now, nextPrayer }: Props) {
  const { tag, reminder, context } = reminderFor(data, today, now, nextPrayer)
  return (
    <figure className={`card reminder tag-${tag}`}>
      <figcaption className="reminder-head">{TAG_HEADINGS[tag]}</figcaption>
      <blockquote>“{reminder.text}”</blockquote>
      <p className="muted small">— {reminder.source}</p>
      {tag === 'qada' && context.owed > 0 && (
        <p className="small">
          You have {context.owed} missed prayer{context.owed === 1 ? '' : 's'} to make up. You can mark them on the
          History tab.
        </p>
      )}
    </figure>
  )
}
