import express from "express";
import {
  getHotelDashboard,
  getAllRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  getAllReservationsForHotel
} from "../controllers/hotelController.js";
import {
  authenticateUser,
  authenticateHotelOwner
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Hotel routes with proper authentication
router.get("/:hotelId/dashboard", authenticateHotelOwner, getHotelDashboard);
router.get("/:hotelId/rooms", getAllRooms);
router.post("/:hotelId/rooms", authenticateHotelOwner, addRoom);
router.put("/:hotelId/rooms/:roomId", authenticateHotelOwner, updateRoom);
router.delete("/:hotelId/rooms/:roomId", authenticateHotelOwner, deleteRoom);
router.get("/:hotelId/reservations", authenticateHotelOwner, getAllReservationsForHotel);

export default router;