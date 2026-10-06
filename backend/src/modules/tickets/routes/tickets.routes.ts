import { Router } from "express";
import * as ticketsController from "../controllers/tickets.controller.js";
import { authenticate, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/my", authenticate, ticketsController.myTickets);
router.get("/:id/qr", authenticate, ticketsController.downloadQr);
router.post("/validate", authenticate, requireRole("ADMIN"), ticketsController.validate);
router.get("/", authenticate, requireRole("ADMIN"), ticketsController.listAll);

export default router;
