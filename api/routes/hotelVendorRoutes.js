import express from "express";
import * as hotelVendorController from "../controllers/hotelVendorController.js";
const router = express.Router();

// Dashboard
router.get("/hotel-dashboard/overview", hotelVendorController.getHotelDashboardOverview);
router.get("/hotel-bookings/recent", hotelVendorController.getHotelBookingsRecent);
router.get("/hotel-payments/recent", hotelVendorController.getHotelPaymentsRecent);
router.get("/hotel-branches", hotelVendorController.getHotelBranches);
router.get("/hotel-staff", hotelVendorController.getHotelStaffList);

// Payments
router.get("/hotel-accounts", hotelVendorController.getHotelAccounts);
router.post("/hotel-accounts/verify", hotelVendorController.verifyHotelAccount);
router.post("/hotel-accounts", hotelVendorController.createHotelAccount);
router.put("/hotel-accounts/:id", hotelVendorController.updateHotelAccount);
router.get("/hotel-payments/stats", hotelVendorController.getHotelPaymentsStats);
router.get("/hotel-payments/transactions", hotelVendorController.getHotelPaymentsTransactions);

// Staff
router.get("/hotel-staff", hotelVendorController.getHotelStaffList);
router.post("/hotel-staff", hotelVendorController.createHotelStaff);
router.put("/hotel-staff/:id", hotelVendorController.updateHotelStaff);
router.delete("/hotel-staff/:id", hotelVendorController.deleteHotelStaff);

// Settings
router.get("/hotel-profile", hotelVendorController.getHotelProfile);
router.put("/hotel-profile", hotelVendorController.updateHotelProfile);
router.put("/hotel-profile/password", hotelVendorController.updateHotelProfilePassword);

// Reservations (Rooms)
router.get("/hotel-rooms", hotelVendorController.getHotelRooms);
router.post("/hotel-rooms", hotelVendorController.createHotelRoom);
router.put("/hotel-rooms/:id", hotelVendorController.updateHotelRoom);
router.delete("/hotel-rooms/:id", hotelVendorController.deleteHotelRoom);

export default router;
