import express from "express";
import {
  getAllLocations,
  getAllChains,
  getVendorAnalytics,
  getVendorDetails,
  getRevenueAnalytics,
  getPaymentsChart,
  getPaymentsTransactions
} from "../controllers/superAdminController.js";
import { authenticateSuperAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Super admin routes
router.get("/locations", authenticateSuperAdmin, getAllLocations);
router.get("/chains", authenticateSuperAdmin, getAllChains);
router.get("/analytics/vendors", authenticateSuperAdmin, getVendorAnalytics);
router.get("/analytics/vendor/:vendorId", authenticateSuperAdmin, getVendorDetails);
router.get("/analytics/revenue", authenticateSuperAdmin, getRevenueAnalytics);

// Payments endpoints for super admin
router.get("/payments/chart", authenticateSuperAdmin, getPaymentsChart);
router.get("/payments/transactions", authenticateSuperAdmin, getPaymentsTransactions);

export default router;