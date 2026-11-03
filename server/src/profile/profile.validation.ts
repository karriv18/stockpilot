export type ProfileInput = {
    name?: string;
    email?: string;
};

type ValidationResult = {
    data?: ProfileInput;
    error?: string;
}

export function validateProfileInput(
    body: unknown,
    isPartial = false
): ValidationResult {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "A valid profile object is required" };
    }

    const input = body as Record<string, unknown>;
    const data: ProfileInput = {};

    if (!isPartial || "name" in input) {
        if (
            typeof input.name !== "string" ||
            !input.name.trim() ||
            input.name.trim().length > 150) {
            return {
                error: "Name is required and must be 150 characters or fewer"
            }
        }

        data.name = input.name.trim();
    }

    if (!isPartial || "email" in input) {
        if (
            typeof input.email !== "string" ||
            !input.email.trim() ||
            input.email.trim().length > 100
        ) {
            return {
                error: "EMAIL is Required and must be 100 characters or fewer"
            };
        }

        data.email = input.email.trim();
    }
    return { data }
}