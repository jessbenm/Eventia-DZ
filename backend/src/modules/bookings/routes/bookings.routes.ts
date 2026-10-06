import { Router } from "express";
import * as bookingsController from "../controllers/bookings.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { authenticate, requireRole } from "../../../middlewares/auth.middleware.js";
import { createBookingSchema } from "../validators/bookings.validator.js";

const router = Router();

router.post("/", authenticate, validate(createBookingSchema), bookingsController.create);
router.get("/my", authenticate, bookingsController.myBookings);
router.patch("/:id/cancel", authenticate, bookingsController.cancel);
router.get("/", authenticate, requireRole("ADMIN"), bookingsController.listAll);

export default router;
