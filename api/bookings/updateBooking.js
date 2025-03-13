
import Booking from "../models/Booking.js"; 

export const cancleBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res
        .status(403)
        .json({ message: "Unauthorized: No user ID found" });
    }
    const { bookingId } = req.params;
    const userId = req.user.id; 


    const booking = await Booking.findOne({ _id: bookingId, user: userId });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already canceled" });
    }

    // Updates booking status
    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking canceled successfully", booking });
  } catch (error) {
    console.error("Error canceling booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


