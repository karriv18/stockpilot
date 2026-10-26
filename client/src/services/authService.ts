import type { User } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

type AuthResponse = {
    user: User;
    token: string;
}

type LoginPayload = {
    email: string;
    password: string;
}

type RegisterPayload = {
    name: string;
    email: string;
    password: string;
}

async function request<T>(
    endpoint: string,
    payload: unknown,
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    console.log(data)
    if (!response.ok) {
        throw new Error(data?.message ?? "Something went wrong.");
    }

    return data as T;
}

export const authService = {
    login: (payload: LoginPayload) =>
        request<AuthResponse>("/auth/login", payload),

    register: (payload: RegisterPayload) =>
        request<AuthResponse>("/auth/register", payload),
};