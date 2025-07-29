import express from "express";
import { getPaymentsByVendor } from "../controllers/paymentsController.js";
import { getBranches } from "../controllers/superAdminController.js";
import { getStaffByVendor } from "../controllers/staffController.js";
import { authenticateSuperAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Payments endpoint
router.get("/payments", authenticateSuperAdmin, getPaymentsByVendor);

// Branches endpoint
router.get("/branches", authenticateSuperAdmin, getBranches);

// Staff endpoint
router.get("/staff", authenticateSuperAdmin, getStaffByVendor);

export default router;
