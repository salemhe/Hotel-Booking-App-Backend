
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
      return res.status(400).json({ message: "Booking is already cancelled" });
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

export const updateBooking =async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No user ID found" });
    }
    const {bookingId} = req.params;
    const {type, vendor, menuIds, roomNumber, tableNumber, guests, checkIn, checkOut, status} = req.body;


      // Validate required fields
    if (!type || !vendor || !guests) {
      return res.status(400).json({ message: "Add all required fields." });
    }

    // if (type === "restaurant" && !tableNumber) {
    //   return res.status(400).json({message:"Table number is required for resturant bookings.",});
    // }
    // if (type === "restaurant" && !menuIds) {
    //   return res.status(400).json({message:"Menu Id is required for resturant bookings.",});
    // }
    // if (type === "hotel" && !roomNumber) {
    //   return res.status(400).json({message:"Room number is required for hotel bookings.",});
    // }

    // if (type === "hotel" && (!checkIn || !checkOut)) {
    //   return res.status(400).json({message:"Check-in and Check-out dates are required for hotel bookings.",});
    // }

    const booking = await Booking.findById(bookingId)

    if(!booking){
      return res.status(404).json({message: "Booking not found"})
    }

    if(type) booking.type = type;
    if(vendor) booking.vendorId = vendor;
    if(menuIds) booking.menuId = menuIds;
    if(roomNumber) booking.roomNumber = roomNumber;
    if(tableNumber) booking.tableNumber = tableNumber;
    if(guests) booking.guests = guests;
    if(checkIn) booking.checkIn = checkIn;
    if(checkOut) booking.checkOut = checkOut;
    if(status) booking.status = status;

    await  booking.save();

    res.json({message: "Booking updated successfully", booking})

  }catch(error){
    console.error("Error updating booking:", error);
    res.status(500).json({message: "This is an internal server error, so relax, sip your tea and it will be resolved... lol"})
  }

}


