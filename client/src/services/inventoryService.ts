const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export type MovementType = "IN" | "OUT";

export type InventoryMovement = {
    id: number;
    productId: number;
    type: MovementType;
    quantity: number;
    note?: string | null;
    createdAt: string;
    product: {
        id: number;
        name: string;
        sku: string;
    };
};

export type InventoryMovementInput = {
    productId: number;
    type: MovementType;
    quantity: number;
    note?: string;
};

type MovementsResponse = {
    movements: InventoryMovement[];
};

type MovementResponse = {
    movement: InventoryMovement;
};

async function request<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    if (response.status === 204) {
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

export async function getInventoryMovements(
    token: string,
): Promise<InventoryMovement[]> {
    const result = await request<MovementsResponse>(
        "/inventory/movements",
        token,
    );

    return result.movements;
}

export async function createInventoryMovement(
    data: InventoryMovementInput,
    token: string,
): Promise<InventoryMovement> {
    const result = await request<MovementResponse>(
        "/inventory/movements",
        token,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );

    return result.movement;
}
