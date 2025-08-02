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
import { verifyBankAccount } from "../controllers/hotelVendorController.js";

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
import { getAllVendors } from "../vendors/getvendors.js";
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

router.post('/onboard/:id', upload.fields([
    { name: "profileImages" },
    { name: "roomImages"},
    { name: "dishImage" },
    { name: "itemImage"}
  ]), authenticateVendor, onboard);

// Bank account verification endpoint
router.post('/accounts/verify', verifyBankAccount);

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

// Get vendor by ID (always include status field)
router.get('/:id', authorize, async (req, res) => {
  try {
    const Vendor = (await import('../models/Vendor.js')).default;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const vendorObj = vendor.toObject();
    vendorObj.status = vendorObj.status || (vendorObj.isActive ? 'active' : 'inactive');
    res.json(vendorObj);
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

// Vendor-accessible: List all branches for the current vendor (restaurant users owned by vendor)
router.get('/branches', authenticateVendor, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    // Assuming vendor's branches are users with businessType: 'restaurant' and owner/vendorId = req.user._id
    const branches = await User.find({ businessType: 'restaurant', owner: req.user._id }).select('-password');
    const branchList = branches.map(branch => {
      const obj = branch.toObject();
      obj.status = obj.status || (obj.isActive ? 'active' : 'inactive');
      obj.active = obj.isActive;
      return obj;
    });
    return res.status(200).json(branchList);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
});

// Vendor-accessible: Get branch by ID (restaurant user) with analytics for hotel branches
router.get('/branches/:id', authenticateVendor, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const Reservation = (await import('../models/Reservation.js')).default;
    const branch = await User.findOne({ _id: req.params.id, businessType: 'restaurant' }).select('-password');
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    // Ensure status and isActive are present in the response
    const branchObj = branch.toObject();
    branchObj.status = branchObj.status || (branchObj.isActive ? 'active' : 'inactive');
    branchObj.active = branchObj.isActive;

    // If this branch is a hotel, add analytics
    let analytics = {};
    if (branch.businessType === 'hotel') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      // Reservations for today
      const reservationsToday = await Reservation.countDocuments({
        hotel: branch._id,
        checkInDate: { $gte: today, $lt: tomorrow }
      });
      // Repeat reservations (guests with more than one reservation at this hotel)
      const repeatReservations = await Reservation.aggregate([
        { $match: { hotel: branch._id } },
        { $group: { _id: "$guest.user", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: "repeatCount" }
      ]);
      // Confirmed guests today
      const confirmedGuestsToday = await Reservation.aggregate([
        { $match: { hotel: branch._id, status: "confirmed", checkInDate: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$adults" } } }
      ]);
      // Total revenue
      const totalRevenueAgg = await Reservation.aggregate([
        { $match: { hotel: branch._id } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      analytics = {
        reservationsToday,
        repeatReservations: repeatReservations[0]?.repeatCount || 0,
        confirmedGuestsToday: confirmedGuestsToday[0]?.total || 0,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        menuCategoryData: [] // Not available for hotels
      };
    }
    return res.status(200).json({ success: true, data: { ...branchObj, ...analytics } });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching branch', error: error.message });
  }
});

// Vendor-accessible: Get all reservations for a branch (hotel)
router.get('/branches/:id/reservations', authenticateVendor, async (req, res) => {
  try {
    const Reservation = (await import('../models/Reservation.js')).default;
    // Find all reservations for this hotel branch
    const reservations = await Reservation.find({ hotel: req.params.id });
    // Format as required
    const formatted = reservations.map(r => ({
      id: r._id,
      name: r.guest?.name,
      email: r.guest?.email,
      date: r.checkInDate,
      time: r.checkInDate ? new Date(r.checkInDate).toLocaleTimeString() : undefined,
      guests: r.adults,
      status: r.status
    }));
    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

// Vendor Dashboard (protected by vendor-token cookie)
import { vendorDashboard } from "../controllers/authController.js";
router.get("/vendorDashboard", vendorDashboard);

export default router;
