import Booking from "../models/Booking.js";

export const bookRoomOrTable = async (req, res) => {
  try {

    if (!req.user || !req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No user ID found" });
    }

 

    const {
      vendorId, reservationType, businessName, customerEmail, customerName, location,customerPhone,hotelId, roomNumber,roomType, roomPrice, checkIn, checkOut, nights, adults, children, restaurantId, menuId, mealName, mealPrice, quantity, category, date, time, specialOccasion, seatingPreference, image, guests, totalPrice, specialRequest, paymentMethod
    } = req.body;
    // const image = req.file ? req.file.filename : req.body.image || null;  
    // Validate required fields
    if ( !customerName || !customerEmail || !vendorId || !businessName || !location || !reservationType || !totalPrice|| !guests) {
      return res.status(400).json({ message: "fill the required fields." });
    }
    if (reservationType === "restaurant" && (!menuId || !mealName || !mealPrice || !quantity || !category)) {
  
      return res.status(400).json({message:"All meal details are required for restaurant bookings.",});
    } // WHY DOES THIS BLOCK OF CODE RUN EVEN WHEN THE RESERVATION TYPE IS HOTEL ON POSTMAN?
    if (reservationType === "hotel" && (!hotelId || !roomNumber || !roomPrice || !checkIn || !checkOut || !nights)) {
      return res.status(400).json({message:"All room details are required for hotel bookings.",});
    }

    let parsedDate = null;
    let parsedTime = null;
    let parsedCheckIn = null;
    let parsedCheckOut = null;

    if (reservationType === "restaurant") {
      if (!date || !time) {
        return res.status(400).json({ error: "Date and time are required for restaurant bookings." });
      }
      parsedDate = new Date(date);
      parsedTime = new Date(`1970-01-01T${time}:00`);
      if (isNaN(parsedDate.getTime()) || isNaN(parsedTime.getTime())) {
        return res.status(400).json({ error: "Invalid restaurant date or time format" });
      }
    }

    if (reservationType === "hotel") {
      parsedCheckIn = new Date(checkIn);
      parsedCheckOut = new Date(checkOut);
      if (isNaN(parsedCheckIn.getTime()) || isNaN(parsedCheckOut.getTime())) {
        return res.status(400).json({ error: "Invalid hotel check-in or check-out date format" });
      }
    }


    // Create booking
    const newBooking = new Booking({
      userId: req.user.id, // Authenticated user
      vendorId: vendorId,
      customerName,
      customerEmail,
      customerPhone: customerPhone,
      businessName, 
      location,
      image,
      guests,
      totalPrice,
      specialRequest,
      date: parsedDate,
      specialOccasion,
      seatingPreference: reservationType === "restaurant" ? seatingPreference : null,
      time : reservationType === "restaurant" ? parsedTime : null,

      date: reservationType === "restaurant" ? parsedDate : null,
      checkIn: reservationType === "hotel" ? parsedCheckIn : null,
      checkOut: reservationType === "hotel" ? parsedCheckOut : null,
      nights: reservationType === "hotel" ? nights : null,
      adults: reservationType === "hotel" ? adults : null,
      children: reservationType === "hotel" ? children : null,
      room: reservationType === "hotel" ? {
        hotelId: hotelId,
        roomNumber: roomNumber,
        roomType: roomType,
        roomPrice: roomPrice,
      } : null,
      meals: reservationType === "restaurant" ? [{
        restaurantId: restaurantId,
        menuId: menuId,
        mealName: mealName,
        mealPrice: mealPrice,
        quantity: quantity,
        category: category,
      }] : [],
      reservationType: reservationType, // "hotel" or "restaurant"
      paymentMethod: paymentMethod,
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
