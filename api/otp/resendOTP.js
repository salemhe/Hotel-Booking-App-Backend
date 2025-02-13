import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import { generateOTP } from "../../utils/otpUtils.js";
import {sendOTPEmail} from "../../utils/emailService.js";

export const resendUserOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found." });

    // Check if OTP is valid
    if (user.otpExpires > Date.now()) {
      return res.status(400).json({ message: "OTP still valid and active" });
    }

    //regenerate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); //OTP expires in 10min
     const minutesLeft = Math.round((otpExpires - Date.now()) / (60 * 1000));


    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

  try {
      await sendOTPEmail(email, otp, minutesLeft);
    } catch (emailError) {
      return res.status(500).json({ message: "Failed to send OTP email.", error: emailError.message });
    }



    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP.", error });
  }
};


export const resendVendorOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const vendor = await Vendor.findOne({ email });

    if (!vendor) return res.status(400).json({ message: "User not found." });

    // Check if OTP is valid
    if (vendor.otpExpires > Date.now()) {
      return res.status(400).json({ message: "OTP still valid and active" });
    }

    //regenerate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
     const minutesLeft = Math.round((otpExpires - Date.now()) / (60 * 1000));

    vendor.otp = otp;
    vendor.otpExpires = otpExpires;
    await vendor.save();

      try {
      await sendOTPEmail(email, otp, minutesLeft);
    } catch (emailError) {
      return res.status(500).json({ message: "Failed to send OTP email.", error: emailError.message });
    }



    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP.", error });
  }
};



