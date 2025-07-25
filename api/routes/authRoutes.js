import express from "express";
import { setVendorToken, getVendorToken } from "../controllers/authController.js";

const router = express.Router();

// Set vendor-token cookie
router.post("/set-vendor-token", setVendorToken);

// Get vendor-token cookie
router.get("/get-vendor-token", getVendorToken);

export default router;
