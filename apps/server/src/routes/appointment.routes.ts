import { Router, type IRouter } from "express";
import { appointmentController } from "../controllers/appointment.controller.js";
import { validate } from "../middleware/validate.js";
import { createAppointmentSchema, updateAppointmentSchema } from "@health-portal/shared";

const router: IRouter = Router();

// POST   /api/appointments
router.post("/", validate(createAppointmentSchema), appointmentController.create);

// PUT    /api/appointments/:id
router.put("/:id", validate(updateAppointmentSchema), appointmentController.update);

// DELETE /api/appointments/:id
router.delete("/:id", appointmentController.remove);

export default router;
