const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export type Profile = {
    id: number;
    name: string;
    email: string;
    // profileImageUrl?: string | null;
    // isActive: boolean;
    createdAt?: string;
    // updatedAt?: string;
}

export type ProfileInput = {
    name: string;
    email: string;
    profileImageUrl?: string | null;
}

type ProfileResponse = {
    user: Profile;
}

async function request<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    if (response.status == 204) {
        if (!response.ok) {
            throw new Error("Request failed.");
        }
        return undefined as T;
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            typeof payload === "object" &&
                payload !== null &&
                "message" in payload &&
                typeof payload.message === "string"
                ? payload.message
                : `Request failed with status ${response.status}.`;

        throw new Error(message);
    }

    return payload as T;
}

export async function getProfile(
    token: string
): Promise<ProfileResponse> {
    return request<ProfileResponse>("/auth/me", token, {
        method: "GET",
    });
}


export async function updateProfileImage(
    id: number | string,
    file: File,
    token: string
): Promise<Profile> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/profiles/${id}/image`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: formData
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            typeof payload === "object" &&
                payload !== null &&
                "message" in payload &&
                typeof payload.message === "string"
                ? payload.message
                : `Image upload failed with status ${response.status}.`;

        throw new Error(message);
    }

    return (payload as { profile: Profile }).profile;

}
