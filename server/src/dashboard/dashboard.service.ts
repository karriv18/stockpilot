import { prisma } from "../lib/prisma";

const LOW_STOCK_THRESHOLD = 5;

export async function getDashboardSummary() {
    const [
        totalProducts,
        stockSummary,
        lowStockProducts,
        recentMovements,
    ] = await Promise.all([
        prisma.product.count(),

        prisma.product.aggregate({
            _sum: {
                quantity: true,
            },
        }),

        prisma.product.findMany({
            where: {
                quantity: {
                    lte: LOW_STOCK_THRESHOLD,
                },
            },
            select: {
                id: true,
                name: true,
                sku: true,
                quantity: true,
            },
            orderBy: {
                quantity: "asc"
            },
            take: 10,
        }),

        prisma.stockMovement.findMany({
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 5,
        })
    ]);

    return {
        summary: {
            totalProducts,
            totalStock: stockSummary._sum.quantity ?? 0,
            lowStockCount: await prisma.product.count({
                where: {
                    quantity: {
                        lte: LOW_STOCK_THRESHOLD
                    }
                }
            })
        },
        lowStockProducts,
        recentMovements
    }
}