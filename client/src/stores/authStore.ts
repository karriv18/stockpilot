import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type User = {
    id: number;
    name: string;
    email: string;
};

type AuthState = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                }),

            clearAuth: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: "stockpilot-auth",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
