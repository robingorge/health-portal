import { Router, type IRouter } from "express";
import { prescriptionController } from "../controllers/prescription.controller.js";
import { validate } from "../middleware/validate.js";
import { createPrescriptionSchema, updatePrescriptionSchema } from "@health-portal/shared";

const router: IRouter = Router();

// GET    /api/prescriptions/options — medication + dosage dropdown choices
router.get("/options", prescriptionController.getOptions);

// POST   /api/prescriptions
router.post("/", validate(createPrescriptionSchema), prescriptionController.create);

// PUT    /api/prescriptions/:id
router.put("/:id", validate(updatePrescriptionSchema), prescriptionController.update);

// DELETE /api/prescriptions/:id
router.delete("/:id", prescriptionController.remove);

export default router;
