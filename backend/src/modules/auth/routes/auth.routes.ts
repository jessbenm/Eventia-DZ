import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { registerSchema, loginSchema, refreshSchema, googleAuthSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleAuthSchema), authController.googleLogin);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", validate(refreshSchema), authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
