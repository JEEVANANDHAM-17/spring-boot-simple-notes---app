const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.'

    try {
      const error = JSON.parse(await response.text())
      message = error.message || error.error || message
    } catch {
      // Keep the friendly fallback when the server has no JSON error body.
    }

    throw new Error(message)
  }

  const body = await response.text()
  return body ? JSON.parse(body) : null
}

export const notesApi = {
  getAll: () => request('/api/notes'),
  create: (note) =>
    request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    }),
  update: (id, note) =>
    request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    }),
  remove: (id) => request(`/api/notes/${id}`, { method: 'DELETE' }),
}
