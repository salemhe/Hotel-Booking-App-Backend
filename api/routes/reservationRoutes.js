import express from "express";
import {
  confirmReservation,
  updateReservationStatus, createReservation 
} from "../controllers/reservationController.js";
import {
  authenticateUser,
  authenticateHotelOwner
} from "../middlewares/authMiddleware.js"; // Note: it's "middleware" not "middlewares"

const router = express.Router();

// Reservation routes
router.post("/", authenticateUser, createReservation);
router.put("/:reservationId/confirm", authenticateHotelOwner, confirmReservation);
router.put("/:reservationId/status", authenticateHotelOwner, updateReservationStatus);

router.get("/test", (req, res) => {
  res.send("✅ Reservation route working!");
});

export default router;