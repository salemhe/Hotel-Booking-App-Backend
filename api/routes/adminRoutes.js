import express from "express";
import { getVendors } from "../vendors/getvendors.js";
import { getUsers } from "../users/getUsers.js";
import { getTransactions } from "../payments/getTransaction.js";
import { updateVendorProfile } from "../vendors/updateVendorProfile.js";
import { deleteVendor } from "../vendors/deleteVendor.js";
// import getFinancials from "./financial.js";
import { getMetrics } from "../payments/getMetrics.js";

const router = express.Router();

// Admin routes go here
router.get("/vendors", getVendors);
router.get("/users", getUsers);
router.get("/transactions", getTransactions);
// router.get("/financials", getFinancials);
router.get("/metrics", getMetrics);
router.patch("/vendors/:id", updateVendorProfile);
router.delete("/vendors/:id", deleteVendor);

export default router;
