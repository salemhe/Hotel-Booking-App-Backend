import User from "../models/User.js";
import  dotenv from "dotenv";

dotenv.config();

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userIdFromParams = req.params.id

    if (userId !== userIdFromParams) {
      return res.status(403).json({ message: "Unauthorized: Wrong user ID" });
    }
    if (!userId && !userIdFromParams) {
      return res.status(403).json({ message: "Unauthorized: No user ID found" });
    }

    const { firstName, lastName, phone } = req.body;
    const userImage = req.file?.filename || null;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }



    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (userImage) {
        const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
        user.profileImage = `${BASE_URL}/uploads/${userImage}`;
      }

    await user.save();

    res.status(200).json({
      message: "User profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
