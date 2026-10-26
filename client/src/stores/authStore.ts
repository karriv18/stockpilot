import { create } from 'zustand'

type User = {
    id: number
    name: string
    email: string
}

type AuthState = {
    user: User | null
    token: string | null
    setAuth: (user: User, token: string) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,

    setAuth: (user, token) => set({ user, token }),

    clearAuth: () => set({
        user: null,
        token: null,
    }),
}))
