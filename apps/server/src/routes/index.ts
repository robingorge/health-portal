import { Router, type IRouter } from "express";
import patientRoutes from "./patient.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import prescriptionRoutes from "./prescription.routes.js";
import authRoutes from "./auth.routes.js";
import portalRoutes from "./portal.routes.js";

const router: IRouter = Router();

router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/auth", authRoutes);
router.use("/portal", portalRoutes);

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

export default router;
