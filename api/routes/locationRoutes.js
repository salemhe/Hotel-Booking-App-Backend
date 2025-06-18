import express from "express";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  getLocation
} from "../controllers/locationController.js";
import {
  authenticateUser,
  authenticateSuperAdmin
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Location routes
router.post("/", authenticateSuperAdmin, createLocation);
router.get("/:locationId", authenticateUser, getLocation);
router.put("/:locationId", authenticateSuperAdmin, updateLocation);
router.delete("/:locationId", authenticateSuperAdmin, deleteLocation);

export default router;