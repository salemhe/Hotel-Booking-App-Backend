import express from "express";
import {
  getAllLocations,
  getAllChains,
  getVendorAnalytics,
  getVendorDetails,
  getRevenueAnalytics,
  createBranch,
  getBranches
} from "../controllers/superAdminController.js";
import {
  getBranchReservations,
  getBranchProfits,
  getBranchDashboard
} from "../controllers/branchDataController.js";
import { authenticateSuperAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Super admin routes
router.get("/locations", authenticateSuperAdmin, getAllLocations);
router.get("/chains", authenticateSuperAdmin, getAllChains);
router.get("/analytics/vendors", authenticateSuperAdmin, getVendorAnalytics);
router.get("/analytics/vendor/:vendorId", authenticateSuperAdmin, getVendorDetails);
router.get("/analytics/revenue", authenticateSuperAdmin, getRevenueAnalytics);

// Branch management
router.post("/branches", authenticateSuperAdmin, createBranch);
router.get("/branches", authenticateSuperAdmin, getBranches);
router.get("/branches/:id", authenticateSuperAdmin, getBranchById);
router.put("/branches/:id", authenticateSuperAdmin, updateBranch);
router.delete("/branches/:id", authenticateSuperAdmin, deleteBranch);
router.get("/branches/:id/reservations", authenticateSuperAdmin, getBranchReservations);
router.get("/branches/:id/profits", authenticateSuperAdmin, getBranchProfits);
router.get("/branches/:id/dashboard", authenticateSuperAdmin, getBranchDashboard);

export default router;