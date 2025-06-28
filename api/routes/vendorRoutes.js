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
import { getMenusByVendor } from "../menus/getMenu.js";
import { createPaymentDetails } from "../payments/createPaymentDetails.js";
import { makeWithdrawal } from "../payments/withdrawPayment.js";
import { getTransactions } from "../payments/getTransaction.js";
import { updateVendorProfile } from "../vendors/updateVendorProfile.js";
import { confirmBooking } from "../bookings/updateBooking.js";
import { getBalance } from "../payments/getBalance.js";
import { deleteMenu } from "../menus/deleteMenu.js";
import { editMenu } from "../menus/editMenu.js";
import { onboard } from "../vendors/onboard.js";

const router = express.Router();
const validation = [
  body("name").notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password"),
];

router.post('/register', upload.single('profileImage'), registerVendor);

// Vendor login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
], loginVendor);

// Get all vendors (authorized route)
router.get('/', getVendors);

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

router.patch("/bookings/confirm/:bookingId", authenticateVendor, confirmBooking);

router.patch('/onboard/:id', upload.array('profileImages', 5), authenticateVendor, onboard);

// ======= Added basic CRUD routes for Vendor =======

// Create a new vendor (if you want this separately from register)
router.post('/create', async (req, res) => {
  try {
    const vendor = new (await import('../models/Vendor.js')).default(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get vendor by ID
router.get('/:id', authorize, async (req, res) => {
  try {
    const Vendor = (await import('../models/Vendor.js')).default;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update vendor by ID (alternative to your existing /update/:id route)
router.put('/:id', authorize, async (req, res) => {
  try {
    const Vendor = (await import('../models/Vendor.js')).default;
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vendor by ID
router.delete('/:id', authorize, async (req, res) => {
  try {
    const Vendor = (await import('../models/Vendor.js')).default;
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public endpoint to get available rooms for a vendor's business-type hotels
import Hotel from "../models/Hotel.js";
import Vendor from "../models/Vendor.js";

router.get('/:vendorId/available-rooms', async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    // Find the vendor and ensure businessType is 'hotel'
    const vendor = await Vendor.findById(vendorId);
    if (!vendor || vendor.businessType.toLowerCase() !== 'hotel') {
      return res.status(404).json({ message: 'Business-type hotel vendor not found' });
    }
    // Find hotels where owner is the vendor's _id
    const hotels = await Hotel.find({ owner: vendorId, isActive: true });
    if (!hotels.length) {
      return res.status(404).json({ message: 'No hotels found for this vendor' });
    }
    // Collect available rooms from all hotels
    const availableRooms = hotels.flatMap(hotel =>
      hotel.rooms.filter(room => room.isAvailable)
        .map(room => ({ ...room.toObject(), hotelId: hotel._id, hotelName: hotel.name }))
    );
    return res.status(200).json({
      vendor: vendor.businessName,
      availableRooms
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching available rooms', error: error.message });
  }
});

export default router;
