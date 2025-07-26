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
import { getBookings } from "../bookings/getBooking.js";
import { cancleBooking } from "../bookings/updateBooking.js";
import { updateBooking } from "../bookings/updateBooking.js";
import { initializePayment } from "../payments/initializePayment.js";
import { verifyPayment } from "../payments/verifyPayment.js";
import { getRestaurants } from "../vendors/vendorDetailedSearch.js";
import { getHotels } from "../vendors/vendorDetailedSearch.js";
import { getTransactions } from "../payments/getTransaction.js";
import { updateUserProfile } from "../users/updateUserProfile.js";

const router = express.Router();

const validation = [
  body("firstName").notEmpty().withMessage("First name is required."),
  body("lastName").notEmpty().withMessage("Last name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];
router.post("/register", upload.single("profileImage"), validation, registerUser);

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
import { getCurrentUserProfile } from "../users/profile.js";
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


router.post('/create', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', authorize, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user by ID (alternative to your existing /update/:id route)
router.put('/:id', authorize, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user by ID
router.delete('/:id', authorize, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Dashboard (protected by user-token cookie)
import { userDashboard } from "../controllers/authController.js";
router.get("/userDashboard", userDashboard);

export default router;
