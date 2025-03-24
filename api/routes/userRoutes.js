import express from "express";
import { body } from "express-validator";
import upload from "../middlewares/uploadMiddleware.js";
import { registerUser } from "../users/register.js";
import { loginUser } from "../users/login.js";
import { getUserProfile } from "../users/profile.js";
import { authorize, authenticateUser } from "../middlewares/authMiddleware.js";
import { verifyUserOTP } from "../otp/verifyOTP.js";
import { resendUserOTP } from "../otp/resendOTP.js";
import { bookRoomOrTable } from "../bookings/createBooking.js";
import { getBookings} from "../bookings/getBooking.js"
import { cancleBooking } from "../bookings/updateBooking.js";
import { updateBooking } from "../bookings/updateBooking.js";



const router = express.Router();

const validation = [
  body("firstName").notEmpty().withMessage("First name is required."),
  body("lastName").notEmpty().withMessage("Last name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];
router.post( "/register",upload.single("profileImage"),validation,registerUser);

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
router.get("/profile/:id",authorize, getUserProfile);

router.post("/verify-otp", verifyUserOTP);
router.post("/resend-otp", resendUserOTP);

router.post("/bookings", authenticateUser, bookRoomOrTable);
router.get("/bookings", authorize, getBookings);
router.patch("/bookings/cancel/:bookingId", authenticateUser, cancleBooking);
router.patch("/bookings/update/:bookingId", authenticateUser, updateBooking);

export default router;
