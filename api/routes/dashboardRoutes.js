import express from "express";
import { getPaymentsByVendor } from "../controllers/paymentsController.js";
import { getBranches } from "../controllers/superAdminController.js";
import { getStaff } from "../controllers/staffController.js";
import { 
  getStats, 
  getTodayReservations, 
  getTrends, 
  getCustomerFrequency, 
  getRevenueByCategory, 
  getReservationSources, 
  getAllBranches 
} from "../controllers/dashboardController.js";
import { authenticateSuperAdmin, authenticateVendor } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Payments endpoint
router.get("/payments", authenticateSuperAdmin, getPaymentsByVendor);

// Branches endpoint
router.get("/branches", authenticateSuperAdmin, getBranches);// Staff endpoint
router.get("/staff", authenticateSuperAdmin, getStaff);

// Dashboard Statistics
router.get("/stats", authenticateVendor, getStats);

// Today's Reservations
router.get("/reservations/today", authenticateVendor, getTodayReservations);

// Trends Data
router.get("/trends", authenticateVendor, getTrends);

// Customer Frequency
router.get("/customers/frequency", authenticateVendor, getCustomerFrequency);

// Revenue by Category
router.get("/revenue/by-category", authenticateVendor, getRevenueByCategory);

// Reservation Sources
router.get("/reservations/sources", authenticateVendor, getReservationSources);

// All branches (authenticated vendor's branches)
router.get("/branches/all", authenticateVendor, getAllBranches);

export default router;
