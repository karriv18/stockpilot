import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null

    if (!token || !JWT_SECRET) {
        return res.status(401).json({
            message: 'Authentication required.',
        })
    }

    try {
        jwt.verify(token, JWT_SECRET)
        return next()
    } catch {
        return res.status(401).json({
            message: 'Session expired or invalid. Please log in again.',
        })
    }
}