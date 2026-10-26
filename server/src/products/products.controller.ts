import type { Request, Response } from "express"
import type { AuthRequest } from "../auth/auth.middleware"
import * as productService from "./products.service"
import { validateProductInput } from "./products.validation"
import fs from "node:fs/promises";
import path from "node:path";

function getId(value: string): number | null {
    if (!/^[1-9]\d*$/.test(value)) return null;

    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
}

function prismaErrorCode(error: unknown): string | undefined {
    if (
        error !== null &&
        typeof error === "object" &&
        "code" in error &&
        typeof error.code === "string"
    ) {
        return error.code;
    }
    return undefined;
}

export async function listProducts(_req: Request, res: Response) {
    try {
        const products = await productService.getProducts();
        res.status(200).json({ products });
    } catch (error) {
        console.error("List products failed:", error);
        res.status(500).json({ message: "Unable to fetch products" });
    }
}

export async function getProduct(req: Request, res: Response) {
    const id = getId(req.params.id as string);

    if (id === null) {
        res.status(400).json({ message: "Invalid product ID" });
        return;
    }

    try {
        const product = await productService.getProductById(id);

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(200).json({ product });
    } catch (error) {
        console.error("Get product failed:", error);
        res.status(500).json({
            message: "Unable to fetch product"
        });
    }
}


export async function createProduct(req: AuthRequest, res: Response) {
    if (typeof req.userId !== "number") {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    const result = validateProductInput(req.body);

    if (result.error || !result.data) {
        res.status(400).json({ message: result.error });
        return;
    }

    try {
        const product = await productService.createProduct(
            result.data,
            req.userId,
        );

        res.status(201).json({ product });
    } catch (error) {
        if (prismaErrorCode(error) === "P2002") {
            res.status(409).json({ message: "SKU already exists" });
            return;
        }

        console.error("Create product failed:", error);
        res.status(500).json({ message: "Unable to create product" });
    }
}

export async function updateProduct(req: AuthRequest, res: Response) {
    const id = getId(req.params.id as string);
    if (id === null) {
        res.status(400).json({ message: "Invalid product ID" });
        return;
    }

    if (typeof req.userId !== "number") {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    const result = validateProductInput(req.body, true);

    if (result.error || !result.data) {
        res.status(400).json({ message: result.error });
        return;
    }

    try {
        const product = await productService.updateProduct(id, result.data);
        res.status(200).json({ product });
    } catch (error) {
        if (prismaErrorCode(error) === "P2025") {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        if (prismaErrorCode(error) === "P2002") {
            res.status(409).json({ message: "SKU already exists" });
            return;
        }

        console.error("Update product failed:", error);
        res.status(500).json({ message: "Unable to update product" });
    }
}

export async function removeProduct(req: AuthRequest, res: Response) {
    const id = getId(req.params.id as string);
    if (id === null) {
        res.status(400).json({ message: "Invalid product ID" });
        return;
    }

    if (typeof req.userId !== "number") {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        await productService.deleteProduct(id);
        res.status(204).send();
    } catch (error) {
        if (prismaErrorCode(error) === "P2025") {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        if (["P2003", "P2014"].includes(prismaErrorCode(error) ?? "")) {
            res.status(409).json({
                message: "Cannot delete a product that has stock movement history",
            });
            return;
        }

        console.error("Delete product failed:", error);
        res.status(500).json({ message: "Unable to delete product" });
    }
}


export async function uploadProductImageController(
    req: AuthRequest,
    res: Response,
) {
    const id = getId(req.params.id as string);

    if (id === null) {
        res.status(400).json({ message: "Invalid product ID" });
        return;
    }

    if (!req.file) {
        res.status(400).json({ message: "Product image is required" });
        return;
    }

    try {
        const product = await productService.updateProductImage(
            id,
            `/uploads/${req.file.filename}`,
        );

        res.status(200).json({ product });
    } catch (error) {
        await fs.unlink(req.file.path).catch(() => { });

        if (prismaErrorCode(error) === "P2025") {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        console.error("Upload product image failed:", error);
        res.status(500).json({ message: "Unable to upload product image" });
    }
}