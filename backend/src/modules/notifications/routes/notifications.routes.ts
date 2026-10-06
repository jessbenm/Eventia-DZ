import { Router } from "express";
import * as notificationsController from "../controllers/notifications.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, notificationsController.list);
router.patch("/:id/read", authenticate, notificationsController.markRead);
router.patch("/read-all", authenticate, notificationsController.markAllRead);

export default router;
