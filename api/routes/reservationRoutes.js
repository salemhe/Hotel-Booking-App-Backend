import express from "express";
import {
  confirmReservation,
  updateReservationStatus
} from "../controllers/reservationController.js";
import {
  authenticateUser,
  authenticateHotelOwner
} from "../middlewares/authMiddleware.js"; // Note: it's "middleware" not "middlewares"

const router = express.Router();

// Reservation routes
router.put("/:reservationId/confirm", authenticateHotelOwner, confirmReservation);
router.put("/:reservationId/status", authenticateHotelOwner, updateReservationStatus);

export default router;