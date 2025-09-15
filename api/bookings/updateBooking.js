
import Booking from "../models/Booking.js"; 
import User from "../models/User.js";
import {generateQRCode} from "../utils/generateQRCode.js";
import {sendBookingConfirmationEmail} from "../utils/emailService.js"
import {sendBookingCancelEmail} from "../utils/emailService.js"
import  dotenv from "dotenv";

dotenv.config();


export const cancleBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res
        .status(403)
        .json({ message: "Unauthorized: No user ID found" });
    }
    const { bookingId } = req.params;
    const userId = req.user.id; 


    const booking = await Booking.findOne({ _id: bookingId, userId: userId });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found" });
    }

    if (booking.reservationStatus === "cancelled") {
      return res.status(400).json({ message: "Reservation is already cancelled" });
    }

    // Updates booking status
    booking.reservationStatus = "cancelled"; 
    await booking.save();

    const user = await User.findById(userId);
    if (user) {

      await sendBookingCancelEmail(user.email, user.firstName, booking._id, booking.guests, booking.reservationDate)

    }

    res.json({ message: "Reservation canceled successfully", booking });
  } catch (error) {
    console.error("Error canceling reservation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const confirmBooking = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor.id) {
        return res
        .status(403)
        .json({ message: "Unauthorized: No vendor ID found" });
    }
    const { bookingId } = req.params;
    const vendorId = req.vendor; 

    if (id !== vendorId.toString()) {
      return res.status(403).json({ message: "Unauthorized: Wrong vendor ID" });
    }



    const booking = await Booking.findOne({ _id: bookingId, vendorId: vendorId });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Reservation not found" });
    }

    if (booking.reservationStatus === "confirmed") {
      return res.status(400).json({ message: "Reservation is already confirmed" });
    }

    // Updates booking status
    booking.reservationStatus = "confirmed";
    await booking.save();

    const user = await User.findById(booking.userId);
    if (user) {
      const qrText = `Booking ID: ${booking._id}\nName: ${user.firstName} ${user.lastName}`;
      const qrCodeUrl = await generateQRCode(qrText);

      await sendBookingConfirmationEmail(user.email, user.firstName, qrCodeUrl, booking._id, booking.guests, booking.reservationDate )

    }

    res.json({ message: "Reservation confirmed successfully", booking });
  } catch (error) {
    console.error("Error confirming reservation:", error);
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
    const {type, vendor, menuId, roomNumber, tableNumber, guests, checkIn, checkOut, status} = req.body;


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
    if(menuId) booking.menuId = menuId;
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


