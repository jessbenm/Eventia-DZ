import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { authenticate, requireRole } from "../../../middlewares/auth.middleware.js";
import { updateProfileSchema } from "../validators/users.validator.js";

const router = Router();

router.put("/me", authenticate, validate(updateProfileSchema), usersController.updateMe);
router.get("/", authenticate, requireRole("ADMIN"), usersController.listAll);

export default router;
