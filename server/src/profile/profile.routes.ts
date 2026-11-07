import { Router } from "express";
import { authenticationToken } from "../auth/auth.middleware";
import { updateProfile } from "./profile.controller";
import { uploadProfileImage } from "../profile/upload.middleware";
import { uploadProfileImageController } from "../profile/profile.controller";

const router = Router();

router.use(authenticationToken);

router.get("/:id", updateProfile);

router.post("/:id/image",
    uploadProfileImage.single("image"),
    uploadProfileImageController)

export default router;
