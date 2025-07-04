import Booking from "../models/Booking.js";

export const bookRoomOrTable = async (req, res) => {
  try {

       if (!req.user || !req.user.id) {
         return res
           .status(403)
           .json({ message: "Unauthorized: No user ID found" });
       }

    const { vendorId, businessName, specialOccasion, seatingPreference, customerEmail, customerName, location, meals, guests,totalPrice,specialRequest, date, time, image } = req.body;
    // const image = req.file ? req.file.filename : req.body.image || null;  
    // Validate required fields
    if ( !customerName || !customerEmail || !vendorId || !businessName || !location || !meals || !totalPrice || !date || !guests || !time || !image) {
      return res.status(400).json({ message: "fill the required fields." });
    }
    // if (type === "restaurant" && !tableNumber) {
    //   return res.status(400).json({message:"Table number is required for resturant bookings.",});
    // }
    // if (type === "restaurant" && !menuId) {
    //   return res.status(400).json({message:"Menu Id is required for resturant bookings.",});
    // }
    // if (type === "restaurant" && !date) {
    //   return res.status(400).json({message:"Date is required for resturant bookings.",});
    // }

    // if (type === "hotel" && !roomNumber) {
    //   return res.status(400).json({message:"Room number is required for hotel bookings.",});
    // }

    // if (type === "hotel" && (!checkIn || !checkOut)) {
    //   return res.status(400).json({message:"Check-in and Check-out dates are required for hotel bookings.",});
    // }

//     const parsedCheckIn = new Date(checkIn);
// const parsedCheckOut = new Date(checkOut);
const parsedDate = new Date(date);

if (isNaN(parsedDate.getTime()) || isNaN(parsedDate.getTime())) {
  return res.status(400).json({ error: "Invalid date format" });
}

    // Create booking
    const newBooking = new Booking({
      userId: req.user.id, // Authenticated user
      vendorId: vendorId,
      customerName,
      customerEmail,
      businessName, 
      location,
      image,
      // partySize,
      // menuId,
      // tableNumber,
      // tableType,
      meals,
      // pricePerTable,
      guests,
      totalPrice,
      specialRequest,
      date: parsedDate,
      specialOccasion,
      seatingPreference,
      isPaid: false,
      status: "pending",
      time,

      // menuId: type === "restaurant"? menuId : null,
      // roomNumber: type === "hotel" ? roomNumber : null,
      // tableNumber: type === "restaurant" ? tableNumber : null,
      // date: type === "restaurant" ? parsedDate : null,
      // guests,
      // checkIn: type === "hotel" ? parsedCheckIn : null,
      // checkOut: type === "hotel" ? parsedCheckOut : null,
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
