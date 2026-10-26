export type StockMovementInput = {
    productId: number;
    type: "IN" | "OUT";
    quantity: number;
    note?: string | null;
};

export function validateStockMovement(
    body: unknown,
): { data?: StockMovementInput; error?: string } {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "A valid stock movement object is required" };
    }
    const input = body as Record<string, unknown>;

    if (!Number.isSafeInteger(input.productId) || (input.productId as number < 1)) {
        return { error: "A valid product ID is required" };
    }

    if (input.type !== "IN" && input.type !== "OUT") {
        return { error: "Type must be IN or OUT" };
    }

    if (
        !Number.isSafeInteger(input.quantity) ||
        (input.quantity as number) < 1
    ) {
        return { error: "Quantity must be a positive whole number" };
    }

    if (
        input.note !== undefined &&
        input.note !== null &&
        (typeof input.note !== "string" || input.note.length > 500)
    ) {
        return { error: "Note must be 500 characters or fewer" };
    }

    const data: StockMovementInput = {
        productId: input.productId as number,
        type: input.type,
        quantity: input.quantity as number,
    };

    if ("note" in input) {
        data.note = input.note as string | null;
    }

    return { data };
}
