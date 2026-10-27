
import { prisma } from "../lib/prisma";
import type { ProductInput } from "./products.validation";

const productDetails = {
    createdBy: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
};

export async function getProducts() {
    return prisma.product.findMany({
        include: productDetails,
        orderBy: { createdAt: "desc" },
    });
}

export async function getProductById(id: number) {
    return prisma.product.findUnique({
        where: { id },
        include: productDetails,
    });
}

export async function createProduct(
    data: ProductInput,
    userId: number,
) {
    if (
        data.name === undefined ||
        data.sku === undefined ||
        data.price === undefined ||
        data.quantity === undefined
    ) {
        throw new Error("Required product fields are missing");
    }

    return prisma.product.create({
        data: {
            name: data.name,
            sku: data.sku,
            description: data.description ?? null,
            price: data.price,
            quantity: data.quantity,
            createdById: userId,
        },
        include: productDetails,
    });
}

export async function updateProduct(
    id: number,
    data: ProductInput,
) {
    return prisma.product.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.sku !== undefined && { sku: data.sku }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.quantity !== undefined && {
                quantity: data.quantity,
            }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
        },
        include: productDetails,
    });
}

export async function deleteProduct(id: number) {
    return prisma.product.delete({
        where: { id },
    });
}

export async function updateProductImage(
    id: number,
    imageUrl: string,
) {
    return prisma.product.update({
        where: { id },
        data: { imageUrl },
        include: productDetails,
    });
}
