import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured")
}

const publicUser = (user: {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
})


export async function registerUser(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    });

    if (existingUser)
        throw new Error("EMAIL_ALREADY_EXISTS");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            passwordHash
        }
    })

    return publicUser(user)
}


export async function loginUser(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
        throw new Error("INVALID_CREDENTIALS")

    const token = jwt.sign(
        { sub: String(user.id) },
        JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    return {
        user: publicUser(user),
        token,
    }
}