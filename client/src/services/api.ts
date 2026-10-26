const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = (await import('../stores/authStore')).useAuthStore.getState().token

  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  const payload = await response.json().catch(() => null)

  if (!response.ok) throw new Error(payload?.message ?? payload?.error ?? `Request failed (${response.status})`)

  return payload as T
}
