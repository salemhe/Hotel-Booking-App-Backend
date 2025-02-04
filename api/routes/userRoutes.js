import express from "express";
import { body } from "express-validator";
import upload from "../middlewares/uploadMiddleware.js";
import { registerUser } from "../users/register.js";
import { loginUser } from "../users/login.js";
import { getUserProfile } from "../users/profile.js";
import { authorize } from "../middlewares/authMiddleware.js";
import { verifyOTP } from "../otp/verifyOTP.js";


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

router.post("/verify-otp", verifyOTP);

export default router;
