import Booking from "../models/Booking.js";
import mongoose from "mongoose";

export const getBookings = async (req, res) => {
  try {
    const { type, vendorId, userId, bookingId } = req.query;

    let query = {};

    if (type) query.type = type;
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      query.vendor = new mongoose.Types.ObjectId(vendorId);
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = new mongoose.Types.ObjectId(userId);
    }
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      query._id = new mongoose.Types.ObjectId(bookingId);
    }


    const bookings = await Booking.find(query);
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings.", error });
  }
};

