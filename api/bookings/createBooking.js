import Booking from "../models/Booking.js";

export const bookRoomOrTable = async (req, res) => {
  try {

       if (!req.user || !req.user.id) {
         return res
           .status(403)
           .json({ message: "Unauthorized: No user ID found" });
       }

    const { type, vendor, menuIds, roomNumber, tableNumber, guests, checkIn, checkOut } = req.body;

    // Validate required fields
    if (!type || !vendor || !guests) {
      return res.status(400).json({ message: "Add all required fields." });
    }

    if (type === "restaurant" && !tableNumber) {
      return res.status(400).json({message:"Table number is required for resturant bookings.",});
    }
    if (type === "restaurant" && !menuIds) {
      return res.status(400).json({message:"Menu Id is required for resturant bookings.",});
    }
    if (type === "hotel" && !roomNumber) {
      return res.status(400).json({message:"Room number is required for hotel bookings.",});
    }

    if (type === "hotel" && (!checkIn || !checkOut)) {
      return res.status(400).json({message:"Check-in and Check-out dates are required for hotel bookings.",});
    }

    const parsedCheckIn = new Date(checkIn);
const parsedCheckOut = new Date(checkOut);

if (isNaN(parsedCheckIn.getTime()) || isNaN(parsedCheckOut.getTime())) {
  return res.status(400).json({ error: "Invalid date format" });
}

    // Create booking
    const newBooking = new Booking({
      user: req.user.id, // Authenticated user
      type,
      vendor,
      menuId: type === "restaurant"? menuIds : null,
      roomNumber: type === "hotel" ? roomNumber : null,
      tableNumber: type === "restaurant" ? tableNumber : null,
      guests,
      checkIn: type === "hotel" ? parsedCheckIn : null,
      checkOut: type === "hotel" ? parsedCheckOut : null,
    });

    await newBooking.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Booking created successfully.",
        booking: newBooking,
      });
  } catch (error) {
    console.error("Booking Error:", error);
    res
      .status(500)
      .json({ message: "Error creating new booking.", error: error.message });
  }
};
