import passport from "passport";
import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";

// import Vendor from "../models/Vendor.js";
import bcrypt from "bcrypt";

export const registerVendor = async (req, res) => {
  try {
    const { name, email, phone, address, password, services } =
      req.body;

    // Validate input
    if ( !name || !email || !phone || !address || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check for duplicate email
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res
        .status(409)
        .json({ message: "Vendor with this email already exists." });
    }

    // Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new vendor
    const newVendor = new Vendor({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      services,
    });

    // Save vendor to database
    await newVendor.save();

    res
      .status(201)
      .json({ message: "Vendor added successfully.", vendor: newVendor });
  } catch (error) {
    console.error("Error adding vendor:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate email error." });
    }
    res.status(500).json({ message: "Error adding vendor.", error });
  }
};




