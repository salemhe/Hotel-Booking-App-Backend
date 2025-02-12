
import Vendor from "../models/Vendor.js";


export const getVendors = async (req, res) => {
  try {
    const { businessName, branch } = req.query; // Extract parameters from the query

    const query = {};

    if (businessName) {
      query.businessName = new RegExp(businessName, "i"); // Case-insensitive search
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


