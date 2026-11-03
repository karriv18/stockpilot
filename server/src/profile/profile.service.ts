import { prisma } from "../lib/prisma";
import type { ProfileInput } from "./profile.validation";

export async function updateProfile(id: number, data: ProfileInput) {
    return await prisma.user.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.email !== undefined && { email: data.email }),
            updatedAt: new Date()
        },
    })
}

export async function updateProfileImage(
    id: number,
    imageUrl: string,
) {
    return prisma.user.update({
        where: { id },
        data: { imageUrl },
    })
}
