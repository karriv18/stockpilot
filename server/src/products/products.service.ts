import { prisma } from "../lib/prisma"
import type { ProductInput } from "./products.validation"


const productDetails = {
    createdBy: {
        select: {
            id: true,
            name: true,
            email: true,
        }
    }
};

export async function getProducts() {
    return prisma.product.findMany({
        include: productDetails,
        orderBy: { createdAt: "desc" }
    })
}

export async function getProductById(id: number) {
    return prisma.product.findUnique({
        where: { id },
        include: productDetails
    })
}

export async function createProduct(
    data: ProductInput,
    userId: number,
) {
    return prisma.product.create({
        data: {
            name: data.name,
            sku: data.sku,
            description: data.description ?? null,
            price: data.price,
            createdById: userId,
        },
        include: productDetails,
    })
}

export async function updateProduct(id: number, data: ProductInput) {
    return prisma.product.update({
        where: { id },
        data: {
            ...(data.name !== "" && { name: data.name }),
            ...(data.sku !== "" && { sku: data.sku }),
            ...(data.price !== 0 && { price: data.price }),
            ...(data.description !== undefined && {
                description: data.description
            }),
        },
        include: productDetails
    })
}

export async function deleteProduct(id: number) {
    return prisma.product.delete({ where: { id } });
}
