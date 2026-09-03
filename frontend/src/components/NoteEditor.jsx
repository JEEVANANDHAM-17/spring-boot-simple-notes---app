import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, LoaderCircle, Save, X } from 'lucide-react'

const EMPTY_NOTE = { title: '', content: '' }

export function NoteEditor({ note, isOpen, isSaving, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_NOTE)
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    setForm(note ? { title: note.title, content: note.content } : EMPTY_NOTE)
    setErrors({})
    window.setTimeout(() => titleRef.current?.focus(), 120)
  }, [note, isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSaving, onClose])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!form.title.trim()) nextErrors.title = 'Give your note a title.'
    if (!form.content.trim()) nextErrors.content = 'Add a thought before saving.'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onSave({ title: form.title.trim(), content: form.content.trim() })
  }

  return (
    <div className={`editor-layer ${isOpen ? 'editor-layer--open' : ''}`} aria-hidden={!isOpen}>
      <button className="editor-backdrop" type="button" aria-label="Close editor" onClick={onClose} />
      <aside className="editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div className="editor__header">
          <button className="editor__back" type="button" onClick={onClose} disabled={isSaving}>
            <ArrowLeft size={18} />
            Back to notes
          </button>
          <button className="icon-button" type="button" onClick={onClose} disabled={isSaving} aria-label="Close editor">
            <X size={20} />
          </button>
        </div>

        <form className="editor__form" onSubmit={handleSubmit}>
          <div className="editor__body">
            <div className="editor__intro">
              <span className="eyebrow">{note ? 'Edit note' : 'New note'}</span>
              <h2 id="editor-title">{note ? 'Refine your thought.' : 'Capture it while it’s fresh.'}</h2>
              <p>Your changes are saved to the Spring Boot API.</p>
            </div>

            <label className="field">
              <span>Title</span>
              <input
                ref={titleRef}
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="A clear, memorable title"
                maxLength={120}
                aria-invalid={Boolean(errors.title)}
              />
              <span className="field__meta">
                <span className="field__error">{errors.title}</span>
                <span>{form.title.length}/120</span>
              </span>
            </label>

            <label className="field field--grow">
              <span>Note</span>
              <textarea
                name="content"
                value={form.content}
                onChange={updateField}
                placeholder="Start writing…"
                aria-invalid={Boolean(errors.content)}
              />
              <span className="field__error">{errors.content}</span>
            </label>
          </div>

          <div className="editor__actions">
            <button className="primary-button editor__save" type="submit" disabled={isSaving}>
              {isSaving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}
              {isSaving ? 'Saving…' : note ? 'Save changes' : 'Create note'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
