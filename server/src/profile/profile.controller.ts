import type { Request, Response } from "express";
import type { AuthRequest } from "../auth/auth.middleware";
import * as profileService from "./profile.service";
import { validateProfileInput } from "./profile.validation";
import fs from "node:fs/promises"

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

export async function updateProfile(req: AuthRequest, res: Response) {
    const id = getId(req.params.id as string);

    if (id === null) {
        res.status(400).json({ message: "Invalid profile ID" });
        return;
    }

    if (typeof req.userId !== "number") {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    const result = validateProfileInput(req.body, true);

    if (result.error || !result.data) {
        res.status(400).json({ message: result.error });
        return;
    }

    try {
        const profile = await profileService.updateProfile(id, result.data);
        res.status(200).json({ profile });
    } catch (error) {
        if (prismaErrorCode(error) === "P2025") {
            res.status(404).json({ message: "Profile not found" })
            return;
        }

        console.error("Update product failed:", error);
        res.status(500).json({ message: "Unable to update profile" });
    }
}

export async function uploadProfileImageController(
    req: AuthRequest,
    res: Response
) {
    const id = getId(req.params.id as string);

    if (id === null) {
        res.status(400).json({ message: "Invalid profile ID" })
        return;
    }

    if (!req.file) {
        res.status(400).json({ message: "Profile image is required" });
        return;
    }

    try {
        const profile = await profileService.updateProfileImage(
            id,
            `/uploads/profile/${req.file.filename}`
        );

        res.status(200).json({ profile });
    } catch (error) {
        await fs.unlink(req.file.path).catch(() => { });

        if (prismaErrorCode(error) === "P2025") {
            res.status(404).json({ message: "Profile not found" });
            return;
        }

        console.error("Upload product image failed:", error);
        res.status(500).json({ message: `Unable to upload product image ${error}` });
    }
}
