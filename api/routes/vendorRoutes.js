
import express from "express";
 import { body } from "express-validator";
 import upload from "../middlewares/uploadMiddleware.js";
 import { registerVendor } from "../vendors/register.js";
 import { loginVendor } from "../vendors/login.js";
 import { getVendors } from "../vendors/getvendors.js";
 import { authorize } from "../middlewares/authMiddleware.js";
 import { verifyVendorOTP } from "../otp/verifyOTP.js";
 import { resendVendorOTP } from "../otp/resendOTP.js";
 import { createMenu } from "../menus/create.js";
 import { authenticateVendor } from "../middlewares/authMiddleware.js";
 import { getMenusByVendor } from "../menus/getMenu.js"
 import { createPaymentDetails } from "../payments/createPaymentDetails.js";
 import { makeWithdrawal } from "../payments/withdrawPayment.js";
 import { getTransactions } from "../payments/getTransaction.js";


const router = express.Router();

const validation = [

  body("name").notEmpty().withMessage("Name is required."),
   body("email").isEmail().withMessage("Valid email is required."),
   body("password")
=======
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')


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


router.get('/', authorize, getVendors);

router.post('/verify-otp', verifyVendorOTP);

router.post('/resend-otp', resendVendorOTP);

router.post('/create-menu', upload.single('itemImage'), authenticateVendor, createMenu);

router.get('/menus/', authenticateVendor, getMenusByVendor);

router.patch('/save-payment', authenticateVendor, createPaymentDetails);

router.post('/withdraw', authenticateVendor, makeWithdrawal); 

router.get('/transactions/', authenticateVendor, getTransactions);


export default router;
