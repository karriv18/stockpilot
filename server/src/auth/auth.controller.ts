import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { loginUser, registerUser } from "./auth.service"
import type { AuthRequest } from "./auth.middleware";

export async function register(req: Request, res: Response) {
    const { name, email, password } = req.body ?? {};
    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !name.trim() ||
        !email.trim() ||
        password.length < 8 ||
        password.length > 72
    ) {
        res.status(400).json({
            message: "Name and email are required; password must be 8–72 characters.",
        })

        return;
    }

    try {
        const user = await registerUser(name, email, password);

        res.status(201).json({ user });
    } catch (error) {
        if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
            res.status(409).json({ message: "Email is already registered" });
            return;
        }

        console.error("Registration failed:", error);
        res.status(500).json({ message: "Unable to register user" });
    }
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password || password.length > 72) {
        res.status(400).json({ message: "Valid email and password are required" });
        return;
    }

    try {
        const result = await loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
            res.status(401).json({ message: "Invalid email or password" })
            return;
        }


        console.error("Login failed:", error);
        res.status(500).json({ message: "Unable to log in" });
    }
}


export async function getMe(req: AuthRequest, res: Response) {
    if (typeof req.userId !== "number") {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(401).json({ message: "User no longer exisits" });
            return;
        }

        res.status(200).json({ user })
    } catch (error) {
        console.error("Fetching current user failed:", error);
        res.status(500).json({ message: "Unable to fetch current user" });
    }
}
