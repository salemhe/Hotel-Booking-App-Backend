import express from 'express';
import { body } from 'express-validator';
import upload from '../middlewares/uploadMiddleware.js';
import { registerVendor } from '../vendors/register.js';
import { loginVendor } from '../vendors/login.js';
import { getVendors } from '../vendors/getvendors.js';
import { authorize } from '../middlewares/authMiddleware.js';
import { verifyVendorOTP } from '../otp/verifyOTP.js';
import { resendVendorOTP } from '../otp/resendOTP.js';
import { createMenu } from '../menus/create.js';
import { authenticateVendor } from '../middlewares/authMiddleware.js';
import { getMenusByVendor } from '../menus/getMenu.js';
import { createPaymentDetails } from '../controllers/payments/createPaymentDetails.js';
import { makeWithdrawal } from '../controllers/payments/withdrawalPayment.js';

// Import the Vendor model
import Vendor from '../models/Vendor.js';

const router = express.Router();

const validation = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

// Vendor registration route
router.post('/register', upload.single('profileImage'), registerVendor);

// Vendor login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
], loginVendor);

// Get all vendors (authorized route)
router.get('/', authorize, getVendors);

// Verify OTP route
router.post('/verify-otp', verifyVendorOTP);

// Resend OTP route
router.post('/resend-otp', resendVendorOTP);

// Create a menu (authenticated route)
router.post('/create-menu', upload.single('itemImage'), authenticateVendor, createMenu);

// Get menus by vendor (authenticated route)
router.get('/menus/', authenticateVendor, getMenusByVendor);

// Save payment details (authenticated route)
router.patch('/save-payment', authenticateVendor, createPaymentDetails);

// Withdraw funds (authenticated route)
router.post('/withdraw', authenticateVendor, makeWithdrawal); // ✅ Now works

export default router;
