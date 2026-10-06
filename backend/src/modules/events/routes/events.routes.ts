import { Router } from "express";
import * as eventsController from "../controllers/events.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { authenticate, requireRole, optionalAuth } from "../../../middlewares/auth.middleware.js";
import { createEventSchema, updateEventSchema, eventQuerySchema } from "../validators/events.validator.js";

const router = Router();

router.get("/", optionalAuth, validate(eventQuerySchema, "query"), eventsController.list);
router.get("/:id", optionalAuth, eventsController.getById);

router.post("/", authenticate, requireRole("ADMIN"), validate(createEventSchema), eventsController.create);
router.put("/:id", authenticate, requireRole("ADMIN"), validate(updateEventSchema), eventsController.update);
router.delete("/:id", authenticate, requireRole("ADMIN"), eventsController.remove);
router.patch("/:id/publish", authenticate, requireRole("ADMIN"), eventsController.publish);
router.patch("/:id/disable", authenticate, requireRole("ADMIN"), eventsController.disable);

export default router;
