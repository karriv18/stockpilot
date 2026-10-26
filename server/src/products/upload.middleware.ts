import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

const uploadDirectory = "/app/uploads";

fs.mkdirSync(uploadDirectory, { recursive: true });


const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDirectory)
    },

    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${randomUUID()}${extension}`);
    }
})

const allowMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
])

export const uploadProductImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (_req, file, callback) => {
        if (!allowMimeTypes.has(file.mimetype)) {
            callback(new Error("Only JPEG, PNG, and WebP images are allowed"));
            return;
        }

        callback(null, true);
    }
})

