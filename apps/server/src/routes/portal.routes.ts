import { Router, type IRouter } from "express";
import { portalController } from "../controllers/portal.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

const router: IRouter = Router();

// All portal routes are session-scoped: the authenticated patient can only
// ever see their own data. requireAuth sets req.patientId from the session.
router.use(requireAuth);

// GET /api/portal/summary — expanded occurrences, next 7 days
router.get("/summary", portalController.summary);

// GET /api/portal/appointments — expanded occurrences, up to 3 months
router.get("/appointments", portalController.appointments);

// GET /api/portal/prescriptions — full prescription records
router.get("/prescriptions", portalController.prescriptions);

// GET /api/portal/prescriptions/refills — expanded refill dates, up to 3 months
router.get("/prescriptions/refills", portalController.refills);

export default router;
