import { getHotelModel, getReservationModel } from "../../utils/modelAdapter.js";
import Hotel from "../models/Hotel.js";
import Reservation from "../models/Reservation.js"
// Get hotel dashboard data
export const getHotelDashboard = async (req, res) => {
  const hotelId = req.params.hotelId;
  
  try {
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }
    
    // Check if user is owner or manager of the hotel
    if (hotel.owner.toString() !== req.user._id.toString() && 
        req.user.role !== "super-admin" &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this hotel dashboard"
      });
    }
    
    // Get recent reservations
    const recentReservations = await Reservation.find({ hotel: hotelId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("guest.user", "name email");
    
    // Calculate analytics
    const totalRooms = hotel.rooms.length;
    const availableRooms = hotel.rooms.filter(room => room.isAvailable).length;
    const occupiedRooms = totalRooms - availableRooms;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    
    // Get revenue data
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyReservations = await Reservation.find({
      hotel: hotelId,
      createdAt: { $gte: startOfMonth },
      status: { $in: ["confirmed", "checked-in", "checked-out"] }
    });
    
    const monthlyRevenue = monthlyReservations.reduce((total, reservation) => {
      return total + reservation.totalAmount;
    }, 0);
    
    // Room type distribution
    const roomTypes = {};
    hotel.rooms.forEach(room => {
      if (!roomTypes[room.type]) {
        roomTypes[room.type] = 0;
      }
      roomTypes[room.type]++;
    });
    
    return res.status(200).json({
      success: true,
      data: {
        hotel: {
          name: hotel.name,
          location: hotel.location,
          rating: hotel.rating
        },
        stats: {
          totalRooms,
          availableRooms,
          occupiedRooms,
          occupancyRate: occupancyRate.toFixed(2)
        },
        revenue: {
          monthly: monthlyRevenue,
          reservationsCount: monthlyReservations.length
        },
        roomTypes,
        recentReservations
      }
    });
  } catch (error) {
    console.error("Error fetching hotel dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching hotel dashboard",
      error: error.message
    });
  }
};

// Add a new room to a hotel
export const addRoom = async (req, res) => {
  const hotelId = req.params.hotelId;
  const roomData = req.body;
  
  try {
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }
    
    // Check authorization
    if (hotel.owner.toString() !== req.user._id.toString() && 
        req.user.role !== "super-admin" &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add rooms to this hotel"
      });
    }
    
    // Check if room number already exists
    const roomExists = hotel.rooms.some(room => room.roomNumber === roomData.roomNumber);
    if (roomExists) {
      return res.status(400).json({
        success: false,
        message: "Room number already exists"
      });
    }
    
    // Add the new room
    hotel.rooms.push(roomData);
    await hotel.save();
    
    // Get the newly added room
    const newRoom = hotel.rooms[hotel.rooms.length - 1];
    
    return res.status(201).json({
      success: true,
      message: "Room added successfully",
      data: newRoom
    });
  } catch (error) {
    console.error("Error adding room:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding room",
      error: error.message
    });
  }
};

// Update a room
export const updateRoom = async (req, res) => {
  const { hotelId, roomId } = req.params;
  const updates = req.body;
  
  try {
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }
    
    // Check authorization
    if (hotel.owner.toString() !== req.user._id.toString() && 
        req.user.role !== "super-admin" &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update rooms in this hotel"
      });
    }
    
    // Find the room
    const roomIndex = hotel.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
    
    // Check if updating room number and if it conflicts
    if (updates.roomNumber && 
        updates.roomNumber !== hotel.rooms[roomIndex].roomNumber) {
      const roomNumberExists = hotel.rooms.some(
        (room, idx) => idx !== roomIndex && room.roomNumber === updates.roomNumber
      );
      
      if (roomNumberExists) {
        return res.status(400).json({
          success: false,
          message: "Room number already exists"
        });
      }
    }
    
    // Update the room
    Object.keys(updates).forEach(key => {
      hotel.rooms[roomIndex][key] = updates[key];
    });
    
    await hotel.save();
    
    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: hotel.rooms[roomIndex]
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating room",
      error: error.message
    });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  const { hotelId, roomId } = req.params;
  
  try {
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }
    
    // Check authorization
    if (hotel.owner.toString() !== req.user._id.toString() && 
        req.user.role !== "super-admin" &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete rooms from this hotel"
      });
    }
    
    // Check if room exists
    const roomIndex = hotel.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
    
    // Check if room has active reservations
    const hasActiveReservations = await Reservation.exists({
      "hotel": hotelId,
      "room.roomId": roomId,
      "status": { $in: ["pending", "confirmed", "checked-in"] }
    });
    
    if (hasActiveReservations) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete room with active reservations"
      });
    }
    
    // Remove the room
    hotel.rooms.splice(roomIndex, 1);
    await hotel.save();
    
    return res.status(200).json({
      success: true,
      message: "Room deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: error.message
    });
  }
};

// Get all rooms for a hotel
export const getAllRooms = async (req, res) => {
  const hotelId = req.params.hotelId;
  
  try {
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      count: hotel.rooms.length,
      data: hotel.rooms
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: error.message
    });
  }
};

// Get all reservations for a hotel
export const getAllReservationsForHotel = async (req, res) => {
  const { hotelId } = req.params;
  const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
  
  try {
    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }
    
    // Check authorization
    if (hotel.owner.toString() !== req.user._id.toString() && 
        req.user.role !== "super-admin" &&
        req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view reservations for this hotel"
      });
    }
    
    // Build query
    const query = { hotel: hotelId };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate) {
      query.checkInDate = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query.checkOutDate = { ...query.checkOutDate, $lte: new Date(endDate) };
    }
    
    // Count total documents for pagination
    const total = await Reservation.countDocuments(query);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get reservations
    const reservations = await Reservation.find(query)
      .populate("guest.user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      count: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: reservations
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching reservations",
      error: error.message
    });
  }
};