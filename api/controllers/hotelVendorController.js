import Hotel from "../models/Hotel.js";
import fs from "fs";
import path from "path";

// GET /api/vendor/hotel-rooms
export const getHotelRooms = async (req, res) => {
  try {
    // Assume vendorId is available from authentication middleware
    const vendorId = req.user?._id || req.vendorId || req.body.vendorId;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Vendor not authenticated" });
    }
    const hotel = await Hotel.findOne({ vendorId });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found for this vendor" });
    }
    return res.status(200).json({ success: true, rooms: hotel.rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching rooms", error: error.message });
  }
};

// POST /api/vendor/hotel-rooms
export const createHotelRoom = async (req, res) => {
  try {
    // Assume vendorId is available from authentication middleware
    const vendorId = req.user?._id || req.vendorId || req.body.vendorId;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Vendor not authenticated" });
    }
    const { rooms, roomImages } = req.body;
    if (!Array.isArray(rooms) || !Array.isArray(roomImages) || rooms.length !== roomImages.length) {
      return res.status(400).json({ success: false, message: "rooms and roomImages must be arrays of equal length" });
    }
    const hotel = await Hotel.findOne({ vendorId });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found for this vendor" });
    }
    // Add each room with its images
    for (let i = 0; i < rooms.length; i++) {
      const roomObj = rooms[i];
      const images = roomImages[i];
      hotel.rooms.push({ ...roomObj, roomImages: images });
    }
    await hotel.save();
    return res.status(201).json({ success: true, message: "Rooms added successfully", rooms: hotel.rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error adding rooms", error: error.message });
  }
};

// PUT /api/vendor/hotel-rooms/:id
export const updateHotelRoom = (req, res) => res.json({ message: "Update hotel room" });
// DELETE /api/vendor/hotel-rooms/:id
export const deleteHotelRoom = (req, res) => res.json({ message: "Delete hotel room" });

// Upload multiple images for a room
export const uploadRoomImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }
    const uploadDir = path.join(process.cwd(), "uploads", "rooms");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const urls = [];
    for (const file of req.files) {
      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      // Assuming static files are served from /uploads
      urls.push(`/uploads/rooms/${filename}`);
    }
    return res.status(200).json({ success: true, urls });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error uploading images", error: error.message });
  }
};
