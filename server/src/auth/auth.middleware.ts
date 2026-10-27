import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}

export interface AuthRequest extends Request {
    userId?: number;
}

export function authenticationToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    const authorization = req.headers.authorization;
    const [schema, token] = authorization?.split(" ") ?? [];

    if (schema !== "Bearer" || !token) {
        res.status(401).json({
            message: "Authentication required",
        });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET as string);

        if (
            typeof payload === "string" ||
            typeof payload.sub !== "string" ||
            !/^\d+$/.test(payload.sub)
        ) {
            res.status(401).json({
                message: "Invalid token",
            });
            return;
        }

        req.userId = Number(payload.sub);
        next();
    } catch (error) {
        if (
            error instanceof jwt.TokenExpiredError
        ) {
            res.status(401).json({
                message: "Session expired. Please log in again.",
            });
            return;
        }

        res.status(401).json({
            message: "Invalid token. Please log in again.",
        });
    }

}