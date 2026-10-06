import { Router } from "express";
import * as uploadController from "../controllers/upload.controller.js";
import { authenticate, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.post("/event-image", authenticate, requireRole("ADMIN"), uploadController.uploadEventImage);

export default router;
