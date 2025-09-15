import express from "express";
import { body } from "express-validator";
import upload from "../middlewares/uploadMiddleware.js";
import { getUserProfile } from "../users/profile.js";
import { authorize, authenticateUser } from "../middlewares/authMiddleware.js";
import { verifyUserOTP } from "../otp/verifyOTP.js";
import { resendUserOTP } from "../otp/resendOTP.js";
import { bookRoomOrTable } from "../bookings/createBooking.js";
import { getBookings } from "../bookings/getBooking.js";
import { cancleBooking } from "../bookings/updateBooking.js";
import { updateBooking } from "../bookings/updateBooking.js";
import { initializePayment } from "../payments/initializePayment.js";
import { verifyPayment } from "../payments/verifyPayment.js";
import { getRestaurants } from "../vendors/vendorDetailedSearch.js";
import { getHotels } from "../vendors/vendorDetailedSearch.js";
import { getTransactions } from "../payments/getTransaction.js";
import { updateUserProfile } from "../users/updateUserProfile.js";
import { getCurrentUserProfile } from "../users/profile.js";
import { loginUser, registerUser } from "../controllers/auth.controller.js";

const router = express.Router();

const validation = [
  body("firstName").notEmpty().withMessage("First name is required."),
  body("lastName").notEmpty().withMessage("Last name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

router.post("/register", validation, registerUser);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  loginUser
);
router.get("/profile", authorize, getCurrentUserProfile);
router.get("/profile/:id", authorize, getUserProfile);

router.post("/verify-otp", verifyUserOTP);
router.post("/resend-otp", resendUserOTP);

router.post("/bookings", authenticateUser, bookRoomOrTable);
router.get("/bookings", authorize, getBookings);
router.put("/bookings/cancel/:bookingId", authenticateUser, cancleBooking);
router.put("/bookings/update/:bookingId", authenticateUser, updateBooking);
router.post("/make-payment", authenticateUser, initializePayment);
router.post("/verify-payment", authenticateUser, verifyPayment);
router.get("/restaurant-search", getRestaurants);
router.get("/hotel-search", getHotels);
router.get('/transactions/', authorize, getTransactions);
router.patch('/update/:id', upload.single('profileImage'), authenticateUser, updateUserProfile);

export default router;
