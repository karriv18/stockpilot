
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export type Product = {
    id: number;
    name: string;
    sku: string;
    price: number | string;
    quantity: number;
    description?: string | null;
    imageUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type ProductInput = {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    description?: string;
};

type ProductResponse = {
    product: Product;
};

type ProductsResponse = {
    products: Product[];
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

export async function getProducts(token: string): Promise<Product[]> {
    const result = await request<ProductsResponse>("/products", token);
    return result.products;
}

export async function getProduct(
    id: number | string,
    token: string,
): Promise<Product> {
    const result = await request<ProductResponse>(
        `/products/${id}`,
        token,
    );
    return result.product;
}

export async function createProduct(
    data: ProductInput,
    token: string,
): Promise<Product> {
    const result = await request<ProductResponse>(
        "/products/createProduct",
        token,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );

    return result.product;
}

export async function updateProduct(
    id: number | string,
    data: ProductInput,
    token: string,
): Promise<Product> {
    const result = await request<ProductResponse>(
        `/products/${id}`,
        token,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        },
    );

    return result.product;
}

export async function deleteProduct(
    id: number | string,
    token: string,
): Promise<void> {
    await request<void>(`/products/${id}`, token, {
        method: "DELETE",
    });
}

export async function uploadProductImage(
    id: number | string,
    file: File,
    token: string,
): Promise<Product> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/products/${id}/image`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: formData,
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

    return (payload as { product: Product }).product;
}

