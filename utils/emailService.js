import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";


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
export const sendBookingConfirmationEmail = async (email, firstName, qrCodeUrl, bookingId, guestCount, date) => {
  // const qrCid = "qrcode123"; 
  // const qrPath = path.join("uploads", qrCodeFilename);
  // const BASE_URL = process.env.BASE_URL || "http://localhost:5000"; // or your deployed domain
  // const qrUrl = `${BASE_URL}/uploads/${qrCodeFilename}`;
  console.log("QR Code URL:", qrCodeUrl); // Log the QR code URL for debugging

  try {
    const mailOptions = {
      from: `"Hotel Booking App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Booking Confirmed ✅",
      html: `<div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
          <div style="background: #004aad; color: white; padding: 20px 30px;">
            <h2 style="margin: 0;">Booking Confirmed ✅</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${firstName}</strong>,</p>
            <p style="font-size: 16px; color: #555;">
              Your booking has been <strong>successfully confirmed</strong>. Below is your unique QR code for verification at check-in:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 180px; height: 180px;" />
            </div>

            <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 10px 0;"><strong>Booking ID:</strong></td>
                <td style="text-align: right;">${bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Guests:</strong></td>
                <td style="text-align: right;">${guestCount}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Date:</strong></td>
                <td style="text-align: right;">${date}</td>
              </tr>
          
            </table>

            <p style="color: #666; font-size: 14px;">Thank you for choosing us. We look forward to hosting you.</p>
            <p style="margin-top: 30px; font-size: 14px;">Cheers,<br/><strong>Your Booking Team</strong></p>
          </div>
          <div style="background: #f5f5f5; padding: 15px 30px; text-align: center; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} HotelReservationApp. All rights reserved.
          </div>
        </div>`,
        // attachments: [
        //   {
        //     filename: qrCodeFilename,
        //     path: qrPath,
        //     cid: qrCid, // <- matches the cid used in the image tag
        //   },
        // ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send confirmation mail");
  }
};
export const sendBookingCancelEmail = async (email, firstName, bookingId, guestCount, date) => {
  try {
    const mailOptions = {
      from: `"Hotel Booking App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Booking Cancelled ❌",
      html: `       <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
          <div style="background: #cc0000; color: white; padding: 20px 30px;">
            <h2 style="margin: 0;">Booking Cancelled ❌</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${firstName}</strong>,</p>
            <p style="font-size: 16px; color: #555;">
              We're writing to confirm that your booking has been <strong>successfully cancelled</strong>. We hope to see you again soon.
            </p>

            <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 10px 0;"><strong>Booking ID:</strong></td>
                <td style="text-align: right;">${bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Guests:</strong></td>
                <td style="text-align: right;">${guestCount}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Date:</strong></td>
                <td style="text-align: right;">${date}</td>
              </tr>
        
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{rebookLink}}" style="background: #4CAF50; color: white; text-decoration: none; padding: 12px 25px; font-weight: bold; border-radius: 5px;">Rebook Now</a>
            </div>

            <p style="color: #666; font-size: 14px;">If you have any questions or need assistance, please don’t hesitate to reach out.</p>
            <p style="margin-top: 30px; font-size: 14px;">Warm regards,<br/><strong>Your Booking Team</strong></p>
          </div>
          <div style="background: #f5f5f5; padding: 15px 30px; text-align: center; font-size: 12px; color: #999;">
            © 2025 YourBookingApp. All rights reserved.
          </div>
        </div>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send cancel email");
  }
};
