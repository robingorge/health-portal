import { Router, type IRouter } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "@health-portal/shared";

const router: IRouter = Router();

// POST /api/auth/login
router.post("/login", validate(loginSchema), authController.login);

// POST /api/auth/logout
router.post("/logout", authController.logout);

// GET  /api/auth/me
router.get("/me", authController.me);

export default router;
