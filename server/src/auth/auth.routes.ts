import { Router } from 'express';
import {
    getMe,
    login,
    register,
} from "./auth.controller";
import { authenticationToken } from './auth.middleware';

const router = Router()

router.post("/register", register)

router.post("/login", login)

router.get("/me", authenticationToken, getMe)

export default router;