import passport from "passport";
import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";

import bcrypt from "bcrypt";



export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Error fetching vendors.", error });
  }
};
