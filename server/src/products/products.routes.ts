import { Router } from "express";
import { authenticationToken } from "../auth/auth.middleware";
import { uploadProductImage } from "./upload.middleware"
import {
    createProduct,
    getProduct,
    listProducts,
    removeProduct,
    updateProduct,
    uploadProductImageController
} from "./products.controller";

const router = Router();

router.use(authenticationToken);

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/createProduct", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", removeProduct);
router.post(
    "/:id/image",
    uploadProductImage.single("image"),
    uploadProductImageController,
);
export default router;