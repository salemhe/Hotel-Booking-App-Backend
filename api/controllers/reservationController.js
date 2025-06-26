import { getReservationModel, getHotelModel } from "../../utils/modelAdapter.js";
import Reservation from "../models/Reservation.js";
import Hotel from "../models/Hotel.js";


//============== Create a new reservation ==============//
export const createReservation = async (req, res) => {
  try {
    const {
      hotelId,
      room,
      guest,
      checkInDate,
      checkOutDate,
      adults,
      children,
      specialRequests,
      paymentMethod
    } = req.body;

    
    if (!hotelId || !room?.roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Calculate nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const totalAmount = room.price * nights;

    const reservation = new Reservation({
      hotel: hotelId,
      room: {
        roomId: room.roomId,
        roomNumber: room.roomNumber,
        type: room.type,
        price: room.price
      },
      guest: {
        user: req.user.id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone
      },
      checkInDate,
      checkOutDate,
      nights,
      adults,
      children,
      specialRequests,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending', 
      status: 'pending'
    });

    const savedReservation = await reservation.save();

    return res.status(201).json({
      message: "Reservation successful",
      data: savedReservation
    });

  } catch (error) {
    console.error("Reservation error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Handle reservation confirmation
export const confirmReservation = async (req, res) => {
  const { reservationId } = req.params;
  
  try {
    const Reservation = await getReservationModel();
    const Hotel = await getHotelModel();
    
    const reservation = await Reservation.findById(reservationId)
      .populate("hotel")
      .populate("guest.user");
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }
    
    // Check authorization
    const hotel = await Hotel.findById(reservation.hotel);
    
    if (hotel.owner.toString() !== req.user._id.toString() && 
        req.user.role !== "super-admin" &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to confirm this reservation"
      });
    }
    
    // Update reservation status
    reservation.status = "confirmed";
    await reservation.save();
    
    // Email notification would go here in a production app
    console.log(`Would send confirmation email to ${reservation.guest.email}`);
    
    return res.status(200).json({
      success: true,
      message: "Reservation confirmed successfully",
      data: reservation
    });
  } catch (error) {
    console.error("Error confirming reservation:", error);
    return res.status(500).json({
      success: false,
      message: "Error confirming reservation",
      error: error.message
    });
  }
};

// Update reservation status
export const updateReservationStatus = async (req, res) => {
  const { reservationId } = req.params;
  const { status, notes } = req.body;
  
  // Validate status
  const validStatuses = ["pending", "confirmed", "checked-in", "checked-out", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status provided"
    });
  }
  
  try {
    const Reservation = await getReservationModel();
    const Hotel = await getHotelModel();
    
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }
    
    // Check authorization
    const hotel = await Hotel.findById(reservation.hotel);
    if (hotel.owner.toString() !== req.user._id.toString() && 
        req.user.role !== "super-admin" &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this reservation"
      });
    }
    
    // Update status
    reservation.status = status;
    if (notes) {
      // Add to notes if your schema supports it
      // reservation.notes = notes;
    }
    
    await reservation.save();
    
    return res.status(200).json({
      success: true,
      message: "Reservation status updated successfully",
      data: reservation
    });
  } catch (error) {
    console.error("Error updating reservation status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating reservation status",
      error: error.message
    });
  }
};