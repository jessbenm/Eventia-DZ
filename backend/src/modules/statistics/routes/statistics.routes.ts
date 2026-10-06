import { Router } from "express";
import * as statisticsController from "../controllers/statistics.controller.js";
import { authenticate, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/public", statisticsController.publicStats);
router.get("/overview", authenticate, requireRole("ADMIN"), statisticsController.overview);
router.get("/revenue", authenticate, requireRole("ADMIN"), statisticsController.revenue);

export default router;
