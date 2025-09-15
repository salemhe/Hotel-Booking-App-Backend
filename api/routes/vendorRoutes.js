import express from "express";
import { body } from "express-validator";
import upload from "../middlewares/uploadMiddleware.js";
import { loginStaff } from "../vendors/staffLogin.js";
import { verifyVendorOTP } from "../otp/verifyOTP.js";
import { resendVendorOTP } from "../otp/resendOTP.js";
import { createMenu } from "../menus/create.js";
import { authenticateVendor } from "../middlewares/authMiddleware.js";
import { getMenusByVendor } from "../menus/getMenu.js";
import { createPaymentDetails } from "../payments/createPaymentDetails.js";
import { makeWithdrawal } from "../payments/withdrawPayment.js";
import { getTransactions } from "../payments/getTransaction.js";
import { updateVendorProfile } from "../vendors/updateVendorProfile.js";
import { confirmBooking } from "../bookings/updateBooking.js";
import { getBalance } from "../payments/getBalance.js";
import { deleteMenu } from "../menus/deleteMenu.js";
import { editMenu } from "../menus/editMenu.js";
import {getVendorDashboardStats} from "../bookings/getBooking.js"
import { getAllVendors } from "../vendors/getvendors.js";
import { loginVendor, onboardVendor, registerVendor } from "../controllers/auth.controller.js";

const router = express.Router();

router.post('/register', upload.single('profileImage'), registerVendor);

// Vendor login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
], loginVendor);

router.post('/staff-login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
], loginStaff);

// Get all vendors (authorized route)
router.get('/', getAllVendors);

router.post('/verify-otp', verifyVendorOTP);

router.post('/resend-otp', resendVendorOTP);

router.post('/create-menu', upload.single('itemImage'), authenticateVendor, createMenu);

router.delete('/menus/:id', authenticateVendor, deleteMenu)

router.patch('/menus/:id', authenticateVendor, editMenu)

router.get('/menus/', getMenusByVendor);

router.patch('/save-payment', authenticateVendor, createPaymentDetails);

router.post('/withdraw', authenticateVendor, makeWithdrawal);

router.get('/transactions/', authenticateVendor, getTransactions);

router.get('/balance/', authenticateVendor, getBalance);

router.patch('/update/:id', upload.array('profileImage'), authenticateVendor, updateVendorProfile);

router.put("/bookings/confirm/:bookingId", authenticateVendor, confirmBooking);

router.get("/bookings/stats/:vendorId", authenticateVendor, getVendorDashboardStats);

router.post('/onboard/:id', upload.array("profileImages"), authenticateVendor, onboardVendor);

// router.post('/staff', upload.single('file'), authenticateVendor, createStaff);
// router.post('/staff/verify', verifyStaff);
// router.get('/staff', authenticateVendor, getStaff);
// router.get('/staff/stats', authenticateVendor, getStaffStats);

export default router;
