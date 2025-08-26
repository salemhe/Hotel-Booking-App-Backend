import express from "express";
import { setVendorToken, getVendorToken, setUserToken, getUserToken, clearToken, loginUser, setAdminToken } from "../controllers/authController.js";

const router = express.Router();

// User login
router.post("/login", loginUser);

// Set vendor-token cookie
router.post("/set-vendor-token", setVendorToken);

// Set user-token cookie
router.post("/set-user-token", setUserToken);

// Get user-token cookie
router.get("/get-user-token", getUserToken);

// Clear user-token cookie 
router.get("/clear-token", clearToken);

// Set admin-token cookie
router.post("/set-admin-token", setAdminToken);

// Get vendor-token cookie
router.get("/get-vendor-token", getVendorToken);

export default router;

