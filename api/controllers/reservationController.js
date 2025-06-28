import { getReservationModel, getHotelModel } from "../../utils/modelAdapter.js";

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