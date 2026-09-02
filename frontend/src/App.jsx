import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp,
  BookOpen,
  Braces,
  Check,
  Feather,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { notesApi } from './api/notes.js'
import { Brand } from './components/Brand.jsx'
import { NoteCard } from './components/NoteCard.jsx'
import { NoteEditor } from './components/NoteEditor.jsx'

export default function App() {
  const [notes, setNotes] = useState([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('updated')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      setNotes(await notesApi.getAll())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = normalizedQuery
      ? notes.filter((note) =>
          `${note.title} ${note.content}`.toLowerCase().includes(normalizedQuery),
        )
      : notes

    return [...filtered].sort((first, second) => {
      if (sort === 'title') return first.title.localeCompare(second.title)
      if (sort === 'created') return new Date(second.createdAt) - new Date(first.createdAt)
      return new Date(second.updatedAt) - new Date(first.updatedAt)
    })
  }, [notes, query, sort])

  const openNewNote = () => {
    setSelectedNote(null)
    setEditorOpen(true)
  }

  const openNote = (note) => {
    setSelectedNote(note)
    setEditorOpen(true)
  }

  const closeEditor = useCallback(() => {
    if (!saving) setEditorOpen(false)
  }, [saving])

  const saveNote = async (form) => {
    setSaving(true)

    try {
      if (selectedNote) {
        const updated = await notesApi.update(selectedNote.id, form)
        setNotes((current) => current.map((note) => (note.id === updated.id ? updated : note)))
        setToast('Note updated')
      } else {
        const created = await notesApi.create(form)
        setNotes((current) => [created, ...current])
        setToast('Note created')
      }

      setEditorOpen(false)
    } catch (requestError) {
      setToast(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteNote = async (note) => {
    if (!window.confirm(`Delete “${note.title}”? This can’t be undone.`)) return

    try {
      await notesApi.remove(note.id)
      setNotes((current) => current.filter((item) => item.id !== note.id))
      setToast('Note deleted')
    } catch (requestError) {
      setToast(requestError.message)
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <Brand />
          <button className="icon-button sidebar__close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          <span className="sidebar__label">Workspace</span>
          <button className="nav-item nav-item--active" type="button" onClick={() => setSidebarOpen(false)}>
            <BookOpen size={18} />
            All notes
            <span>{notes.length}</span>
          </button>
        </nav>

        <div className="sidebar__quote">
          <Feather size={22} />
          <p>“The palest ink is better than the best memory.”</p>
          <span>— Chinese proverb</span>
        </div>

        <div className="sidebar__stack">
          <span>Built with</span>
          <div>
            <span><Sparkles size={14} /> React</span>
            <span><Braces size={14} /> Spring Boot</span>
          </div>
        </div>
      </aside>

      {sidebarOpen && <button className="mobile-backdrop" type="button" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your notes"
              aria-label="Search your notes"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
          <button className="primary-button topbar__create" type="button" onClick={openNewNote}>
            <Plus size={18} />
            New note
          </button>
        </header>

        <div className="page">
          <section className="page-heading">
            <div>
              <span className="eyebrow">Your quiet corner</span>
              <h1>Notes worth<br /><em>keeping.</em></h1>
              <p>Capture ideas, shape thoughts, and find them when they matter.</p>
            </div>
            <div className="note-count" aria-label={`${notes.length} total notes`}>
              <span>{String(notes.length).padStart(2, '0')}</span>
              <p>notes in your<br />collection</p>
            </div>
          </section>

          <section className="notes-section" aria-labelledby="notes-heading">
            <div className="section-heading">
              <div>
                <h2 id="notes-heading">Your notes</h2>
                <p>
                  {query
                    ? `${visibleNotes.length} ${visibleNotes.length === 1 ? 'result' : 'results'} for “${query}”`
                    : 'Everything you’ve saved, in one place.'}
                </p>
              </div>
              <label className="sort-control">
                <ArrowDownUp size={16} />
                <span className="sr-only">Sort notes</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="updated">Last updated</option>
                  <option value="created">Newest first</option>
                  <option value="title">Title A–Z</option>
                </select>
              </label>
            </div>

            {loading && (
              <div className="notes-grid" aria-label="Loading notes">
                {[0, 1, 2].map((item) => <div className="note-skeleton" key={item} />)}
              </div>
            )}

            {!loading && error && (
              <div className="state-panel">
                <span className="state-panel__icon">!</span>
                <h3>We couldn’t reach your notes.</h3>
                <p>{error}</p>
                <button className="secondary-button" type="button" onClick={loadNotes}>
                  <RefreshCw size={17} /> Try again
                </button>
              </div>
            )}

            {!loading && !error && visibleNotes.length > 0 && (
              <div className="notes-grid">
                {visibleNotes.map((note, index) => (
                  <NoteCard key={note.id} note={note} index={index} onEdit={openNote} onDelete={deleteNote} />
                ))}
                <button className="new-note-card" type="button" onClick={openNewNote}>
                  <span><Plus size={24} /></span>
                  <strong>Start a new note</strong>
                  <small>There’s always room for one more idea.</small>
                </button>
              </div>
            )}

            {!loading && !error && visibleNotes.length === 0 && (
              <div className="state-panel state-panel--empty">
                <span className="state-panel__icon"><Feather size={24} /></span>
                <h3>{query ? 'No matching notes' : 'A blank page, full of possibility.'}</h3>
                <p>{query ? 'Try a different word or clear your search.' : 'Write down your first thought and make this space yours.'}</p>
                <button className="primary-button" type="button" onClick={query ? () => setQuery('') : openNewNote}>
                  {query ? <X size={17} /> : <Plus size={17} />}
                  {query ? 'Clear search' : 'Create your first note'}
                </button>
              </div>
            )}
          </section>
        </div>

        <footer className="footer">
          <span><Check size={15} /> Connected to the Notes API</span>
          <span>React · Spring Boot · MySQL</span>
        </footer>
      </main>

      <NoteEditor
        note={selectedNote}
        isOpen={editorOpen}
        isSaving={saving}
        onClose={closeEditor}
        onSave={saveNote}
      />

      <div className={`toast ${toast ? 'toast--visible' : ''}`} role="status">
        <Check size={16} /> {toast}
      </div>
    </div>
  )
}
