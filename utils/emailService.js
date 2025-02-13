import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (email, otp, minutesLeft) => {
  try {
    const mailOptions = {
      from: `"Hotel Booking App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `<div style="font-family: Arial, sans-serif; background-color: white; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="text-align: center; color: #4CAF50;">Hotel Booking App</h2>
      <p style="font-size: 16px; color: #333;"><b style="font-size: 20px;">H</b>ello,</p>
      <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for verification is:</p>
      
      <div style="text-align: center; font-size: 22px; font-weight: bold; color: #4CAF50; padding: 10px; border: 2px dashed #4CAF50; display: inline-block; margin: 10px auto;">
        ${otp}
      </div>
      
      <p style="font-size: 14px; color: #777;">This OTP will expire in <strong>${minutesLeft} minutes</strong>. Please use it before it expires.</p>
      
      <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        © ${new Date().getFullYear()} Hotel Booking App. All rights reserved.
      </p>
    </div>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send OTP");
  }
};
