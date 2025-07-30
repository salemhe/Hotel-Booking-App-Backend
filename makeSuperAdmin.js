import mongoose from "mongoose";
import User from "./api/models/User.js";

// TODO: Replace with your actual MongoDB connection string
const MONGO_URI = "mongodb://localhost:27017/YOUR_DB_NAME";

// TODO: Replace with the actual user ID you want to update
const USER_ID = "USER_ID_HERE";

async function makeSuperAdmin(userId) {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findByIdAndUpdate(
      userId,
      { role: "super-admin" },
      { new: true }
    );
    if (user) {
      console.log("User updated to super-admin:", user);
    } else {
      console.log("User not found.");
    }
  } catch (err) {
    console.error("Error updating user:", err);
  } finally {
    await mongoose.disconnect();
  }
}

makeSuperAdmin(USER_ID);
