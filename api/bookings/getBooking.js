import Booking from "../models/Booking.js";

export const getBookings = async (req, res) => {
  try {
    const { type, vendorId, userId } = req.query;

    let query = {}; // for fetch all bookings

    if (type) query.type = type; // Filter by type (hotel/restaurant)
    if (vendorId) query.vendor = vendorId; // Filter by vendor
    if (userId) query.user = userId; // Filter by user

    const bookings = await Booking.find(query).select(
      "_id user vendor menuId type roomNumber tableNumber guest checkIn checkOut status bookingDate"
    );

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings.", error });
  }
};
