import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react'

function relativeDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Recently'

  const diff = date.getTime() - Date.now()
  const days = Math.round(diff / 86_400_000)

  if (Math.abs(days) < 1) return 'Today'
  if (days === -1) return 'Yesterday'

  if (Math.abs(days) < 7) {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(days, 'day')
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  }).format(date)
}

export function NoteCard({ note, index, onEdit, onDelete }) {
  const accent = ['violet', 'coral', 'gold', 'teal'][index % 4]

  return (
    <article
      className={`note-card note-card--${accent}`}
      role="button"
      tabIndex="0"
      onClick={() => onEdit(note)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onEdit(note)
        }
      }}
    >
      <div className="note-card__topline">
        <span className="note-card__date">{relativeDate(note.updatedAt || note.createdAt)}</span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </div>

      <div className="note-card__body">
        <h3>{note.title}</h3>
        <p>{note.content}</p>
      </div>

      <div className="note-card__footer">
        <span className="note-card__label">Note #{note.id}</span>
        <div className="note-card__actions">
          <button
            className="icon-button"
            type="button"
            aria-label={`Edit ${note.title}`}
            onClick={(event) => {
              event.stopPropagation()
              onEdit(note)
            }}
          >
            <Pencil size={16} />
          </button>
          <button
            className="icon-button icon-button--danger"
            type="button"
            aria-label={`Delete ${note.title}`}
            onClick={(event) => {
              event.stopPropagation()
              onDelete(note)
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
