import { prisma } from "../lib/prisma";
import type { StockMovementInput } from "./inventory.validation";

export async function createStockMovement(
    data: StockMovementInput,
    userId: number,
) {
    return prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: { id: data.productId },
            select: { id: true }
        });

        if (!product) {
            throw new Error("PRODUCT_NOT_FOUND");
        }

        const updated = await tx.product.updateMany({
            where: {
                id: data.productId,
                ...(data.type === "OUT" && {
                    quantity: { gte: data.quantity },
                }),
            },
            data: {
                quantity: {
                    [data.type === "IN" ? "increment" : "decrement"]:
                        data.quantity,
                },
            },
        });

        if (updated.count === 0) {
            throw new Error("INSUFFICIENT_STOCK");
        }

        const movement = await tx.stockMovement.create({
            data: {
                productId: data.productId,
                type: data.type,
                quantity: data.quantity,
                note: data.note ?? null,
                createdById: userId,
            }
        });

        const updatedProduct = await tx.product.findUniqueOrThrow({
            where: { id: data.productId },
        });

        return {
            movement,
            product: updatedProduct,
        };
    })
}

export async function getStockMovements() {
    return prisma.stockMovement.findMany({
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    sku: true,
                },
            },
            createdBy: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
}
