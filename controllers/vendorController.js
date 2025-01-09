import Vendor from "../models/Vendor.js";

export const addVendor = async (req, res) => {
  try {
    const { name, email, phone, address, services } = req.body;

    const newVendor = new Vendor({ name, email, phone, address, services });
    await newVendor.save();

    res
      .status(201)
      .json({ message: "Vendor added successfully.", vendor: newVendor });
  } catch (error) {
    res.status(500).json({ message: "Error adding vendor.", error });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendors.", error });
  }
};

