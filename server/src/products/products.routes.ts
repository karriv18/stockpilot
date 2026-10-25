import { Router } from "express";
import { authenticationToken } from "../auth/auth.middleware";
import {
    createProduct,
    getProduct,
    listProducts,
    removeProduct,
    updateProduct,
} from "./products.controller";

const router = Router();

router.use(authenticationToken);

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/createProduct", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", removeProduct);

export default router;