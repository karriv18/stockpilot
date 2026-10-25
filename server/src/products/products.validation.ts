export type ProductInput = {
    name: string;
    sku: string;
    description?: string | null;
    price: number;
};

export function validateProductInput(body: unknown, isPartial = false): { data?: ProductInput; error?: string } {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "A valid product object is required" };
    }

    const input = body as Record<string, unknown>;
    const data: ProductInput = {
        name: "",
        sku: "",
        price: 0,
    }

    if (!isPartial || "name" in input) {
        if (
            typeof input.name !== "string" ||
            !input.name.trim() ||
            input.name.trim().length > 150
        ) {
            return { error: "Name is required and must be 150 characters or fewer" }
        }
        data.name = input.name.trim();
    }

    if (!isPartial || "sku" in input) {
        if (
            typeof input.sku !== "string" ||
            !input.sku.trim() ||
            input.sku.trim().length > 100
        ) {
            return { error: "SKU is required and must be 100 characters or fewer" };
        }
        data.sku = input.sku.trim();
    }

    if (!isPartial || "price" in input) {
        const price =
            typeof input.price === "number"
                ? input.price
                : typeof input.price === "string" && input.price.trim() !== ""
                    ? Number(input.price)
                    : NaN;

        if (!Number.isFinite(price) || price < 0 || price > 9999999999.99) {
            return { error: "Price must be a valid non-negative amount" };
        }

        if (Math.round(price * 100) / 100 !== price) {
            return { error: "Price must have no more than 2 decimal places" };
        }

        data.price = price;
    }
    
    if ("description" in input) {
        if (input.description === null) {
            data.description = null;
        } else if (typeof input.description === "string") {
            if (input.description.length > 2000) {
                return { error: "Description must be 2000 characters or fewer" };
            }
            data.description = input.description.trim();
        } else {
            return { error: "Description must be text or null" };
        }
    }

    return { data };
}
