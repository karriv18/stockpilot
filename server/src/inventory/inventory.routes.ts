import { Router } from "express"
import { authenticationToken } from "../auth/auth.middleware"
import {
    createStockMovement,
    listStockMovements,
} from "./inventory.controller";

const router = Router();

router.use(authenticationToken);

router.get("/movements", listStockMovements);
router.post("/movements", createStockMovement);

export default router