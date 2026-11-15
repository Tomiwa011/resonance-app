const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

// Returns the parsed JSON, or null if the server says 404.
export async function apiGet(path) {
  const response = await fetch(`${BASE_URL}${path}`)

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`)

  return response.json()
}

// Throws an Error whose message is the server's error text, so the UI can show it.
export async function apiPost(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`)
  }

  return data
}