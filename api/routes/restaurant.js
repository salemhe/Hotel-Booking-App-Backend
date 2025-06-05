import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Restaurant from "../models/Restaurant.js";

const router = express.Router();

// Required for resolving file paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/update", upload.array("images", 5), async (req, res) => {
  try {
    const { vendorId, openingTime, closingTime, location, cuisine, priceRange } = req.body;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: "Missing vendorId" });
    }

    const imagePaths = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    // Clean up old images
    const existing = await Restaurant.findOne({ vendorId });
    if (existing && existing.images?.length) {
      for (const imgPath of existing.images) {
        const fullPath = path.join(__dirname, "..", imgPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    // Update the restaurant document
    const updated = await Restaurant.findOneAndUpdate(
      { vendorId },
      {
        openingTime,
        closingTime,
        location,
        cuisine,
        priceRange,
        images: imagePaths,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, restaurant: updated });
  } catch (err) {
    console.error("Restaurant update error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
