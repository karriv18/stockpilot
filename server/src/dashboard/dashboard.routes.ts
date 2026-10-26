import { Router } from "express";
import { authenticationToken } from "../auth/auth.middleware";
import { getDashboard } from "./dashboard.controller";

const router = Router();

router.use(authenticationToken)

router.get("/", getDashboard);

export default router;
