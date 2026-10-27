const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = (await import('../stores/authStore')).useAuthStore.getState().token

  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  const payload = await response.json().catch(() => null)
  if (response.status === 401) {
    const { clearAuth } = (
      await import("../stores/authStore")
    ).useAuthStore.getState();

    clearAuth();

    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }

    throw new Error(
      payload?.message ?? "Session expired. Please log in again.",
    );
  }
  
  if (!response.ok) throw new Error(payload?.message ?? payload?.error ?? `Request failed (${response.status})`)

  return payload as T
}
