import type { Response } from "express";
import type { AuthRequest } from "../auth/auth.middleware";
import * as inventoryService from "./inventory.service";
import { validateStockMovement } from "./inventory.validation";


export async function createStockMovement(
    req: AuthRequest,
    res: Response
) {
    if (typeof req.userId !== "number") {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    const result = validateStockMovement(req.body);

    if (result.error || !result.data) {
        res.status(400).json({ message: result.error });
        return;
    }

    try {
        const resultData = await inventoryService.createStockMovement(
            result.data, req.userId
        );
        res.status(201).json(resultData)
    } catch (error) {
        if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        console.error("Create stock movement failed: ", error);
        res.status(500).json({ message: "Unable to update stock" });
    }
}

export async function listStockMovements(
    _req: AuthRequest,
    res: Response,
) {
    try {
        const movements = await inventoryService.getStockMovements();
        res.status(200).json({ movements })
    } catch (error) {
        console.error("List stock movements failed:", error);
        res.status(500).json({ message: "Unable to fetch stock history" })
    }
}
