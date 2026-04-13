import { Router, type IRouter } from "express";
import { patientController } from "../controllers/patient.controller.js";
import { validate } from "../middleware/validate.js";
import { createPatientSchema, updatePatientSchema } from "@health-portal/shared";

const router: IRouter = Router();

// GET  /api/patients
router.get("/", patientController.getAll);

// GET  /api/patients/:id
router.get("/:id", patientController.getById);

// POST /api/patients
router.post("/", validate(createPatientSchema), patientController.create);

// PUT  /api/patients/:id
router.put("/:id", validate(updatePatientSchema), patientController.update);

// GET  /api/patients/:id/appointments — raw records
router.get("/:id/appointments", patientController.getAppointments);

// GET  /api/patients/:id/prescriptions — raw records
router.get("/:id/prescriptions", patientController.getPrescriptions);

export default router;
