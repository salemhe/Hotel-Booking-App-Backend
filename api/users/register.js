import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import passport from "passport";
import { validationResult } from "express-validator";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Checking if user already exists here
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = new User({
      firstName, lastName, email, password: hashedPassword,phone
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully.", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering user.", error });
  }
};

