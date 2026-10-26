
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export type DashboardStats = {
    totalProducts: number;
    unitsInStock: number;
    lowStockItems: number;
    stockMovementsThisMonth: number;
};

export type DashboardMovement = {
    id: number;
    product: string;
    sku: string;
    type: "IN" | "OUT";
    quantity: number;
    createdAt: string;
    user: string;
};

export type LowStockProduct = {
    id: number;
    name: string;
    sku: string;
    quantity: number;
};

export type DashboardData = {
    stats: DashboardStats;
    movements: DashboardMovement[];
    lowStock: LowStockProduct[];
};

type DashboardApiResponse = {
    summary: {
        totalProducts: number;
        totalStock: number;
        lowStockCount: number;
    };
    recentMovements: {
        id: number;
        type: "IN" | "OUT";
        quantity: number;
        createdAt: string;
        product: {
            id: number;
            name: string;
            sku: string;
        };
        createdBy: {
            id: number;
            name: string;
        };
    }[];
    lowStockProducts: LowStockProduct[];
};

export async function getDashboard(
    token: string
): Promise<DashboardData> {
    const response = await fetch(`${API_URL}/dashboard`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            typeof payload === "object" &&
                payload !== null &&
                "message" in payload &&
                typeof payload.message === "string"
                ? payload.message
                : "Failed to fetch dashboard data.";

        throw new Error(message);
    }

    if (
        typeof payload !== "object" ||
        payload === null ||
        !("summary" in payload) ||
        !("recentMovements" in payload) ||
        !("lowStockProducts" in payload)
    ) {
        console.error("Unexpected dashboard payload:", payload);
        throw new Error("Invalid dashboard response from the server.");
    }

    const result = payload as DashboardApiResponse;

    if (
        !result.summary ||
        !Array.isArray(result.recentMovements) ||
        !Array.isArray(result.lowStockProducts)
    ) {
        console.error("Invalid dashboard data structure:", payload);
        throw new Error("Invalid dashboard data structure.");
    }

    return {
        stats: {
            totalProducts: result.summary.totalProducts,
            unitsInStock: result.summary.totalStock,
            lowStockItems: result.summary.lowStockCount,
            stockMovementsThisMonth: result.recentMovements.length,
        },

        movements: result.recentMovements.map((movement) => ({
            id: movement.id,
            product: movement.product.name,
            sku: movement.product.sku,
            type: movement.type,
            quantity: movement.quantity,
            createdAt: movement.createdAt,
            user: movement.createdBy.name,
        })),

        lowStock: result.lowStockProducts,
    };
}
