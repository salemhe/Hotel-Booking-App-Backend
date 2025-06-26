import Restaurant from "../models/Restaurant.js";

export const createRestaurant = async (req, res) => {
  try {
    const vendorId = req.vendor; 

    const existing = await Restaurant.findOne({ vendorId });
    if (existing) {
      return res.status(400).json({ message: "You already have a restaurant" });
    }

    const {
      openingTime,
      closingTime,
      location,
      cuisine,
      priceRange,
      images = [],
    } = req.body;

    if (!openingTime || !closingTime || !location || !cuisine || !priceRange) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRestaurant = new Restaurant({
      vendorId,
      openingTime,
      closingTime,
      location,
      cuisine,
      priceRange,
      images,
    });

    const saved = await newRestaurant.save();

    return res.status(201).json({
      message: "Restaurant created successfully",
      data: saved,
    });

  } catch (err) {
    console.error(" Error creating restaurant:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
