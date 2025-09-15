import { Vendor } from "../models/Vendor.js";

// Get all vendors with optional filtering by type (restaurant/hotel)
export const getAllVendors = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) {
      query.businessType = new RegExp(type, "i");
    }
    // You can add more filters as needed
    const vendors = await Vendor.find(query).select("-password -otp -otpExpires -__v");
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Error fetching vendors.", error });
  }
};

// (Retain the old getVendors if used elsewhere)
export const getVendors = async (req, res) => {
  try {
    const { businessName, businessType, branch, vendorId } = req.query; // Extract parameters from the query
    const query = {};
    if(vendorId) {
      query._id = vendorId;
    }
    if (businessName) {
      query.businessName = new RegExp(businessName, "i"); // Case-insensitive search
    }
    if (businessType) {
      query.businessType = new RegExp(businessType, "i"); 
    }
    if (branch) {
      query.branch = new RegExp(branch, "i"); 
    }
    const vendors = await Vendor.find(query).select("-password -otp -otpExpires -__v"); 
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Error fetching vendors.", error });
  }
};
