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
       html: `<div style="font-family: 'Inter', 'Segoe UI', sans-serif; background-color: white; max-width: 500px; margin: 40px auto; padding: 36px; border-radius: 16px; border: 1px solid #f0f0f0; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03); color: #1A1A1A;">
      
      <!-- Logo -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
        <div style="width: 16px; height: 16px; background-color: #5BA8FF; border-radius: 50%;"></div>
        <span style="font-size: 22px; font-weight: 700;">Bookies</span>
      </div>

      <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 16px; margin-bottom: 18px;">
        Hello,
      </p>

      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 22px;">
        You requested a one-time password (OTP) for your Bookies account. Use the code below to complete your verification:
      </p>

      <!-- OTP -->
      <div style="margin: 30px auto; text-align: center;">
        <span style="display: inline-block; padding: 16px 60px; font-size: 24px; letter-spacing: 4px; font-weight: 600; color: #000000; background-color: #F2F9FF; border: 2px solid #5BA8FF; border-radius: 12px;">
          ${otp}
        </span>
      </div>

      <p style="font-size: 14px; margin-top: 28px;">
        This code will expire in <strong>${minutesLeft} minutes</strong>. If you didn’t request this code, simply ignore this email.
      </p>

      <p style="font-size: 14px; margin-top: 8px;">
        Thank you for choosing <strong>Bookies</strong>.
      </p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #f0f0f0;" />

      <p style="font-size: 12px; color: #999; text-align: center;">
        &copy; ${new Date().getFullYear()} Bookies. All rights reserved.
      </p>

      <p style="font-size: 11px; color: #aaa; text-align: center;">
        If you did not initiate this request, you can safely ignore or <a href="#" style="color: #aaa; text-decoration: underline;">unsubscribe</a>.
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
      html: `<div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', sans-serif; border: 1px solid #eee; border-radius: 8px; overflow: hidden; background-color: #ffffff;">

    <!-- Logo Header -->
    <div style="padding: 20px 30px; display: flex; align-items: center; gap: 8px;">
      <div style="width: 16px; height: 16px; background-color: #5BA8FF; border-radius: 50%;"></div>
      <span style="font-size: 22px; font-weight: 700; color: #000000;">Bookies</span>
    </div>
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0 30px;">

    <!-- Main Title -->
    <div style="padding: 20px 30px 0;">
      <h1 style="font-size: 24px; color: #222222; margin: 0 0 10px;">🎉 Booking Confirmed</h1>
      <p style="font-size: 16px; color: #000000; margin: 0;">Hi <strong>${firstName}</strong>,</p>
      <p style="font-size: 15px; color: #000000; line-height: 1.6;">
        Your reservation has been <em>successfully confirmed</em>. Present your unique QR code below at check-in for swift verification.
      </p>
    </div>

    <!-- QR Code -->
    <div style="text-align: center; margin: 30px;">
      <div style="display: inline-block; padding: 10px; border: 2px solid #5BA8FF; border-radius: 12px; box-shadow: 0 0 12px rgba(91, 168, 255, 0.4);">
        <img src="${qrCodeUrl}" alt="QR Code" style="width: 180px; height: 180px;" />
      </div>
    </div>

    <!-- Booking Details -->
    <div style="background-color: #F9F9F9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px 24px; margin: 0 30px 30px;">
      <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #5BA8FF; font-weight: 600;">Booking ID:</td>
          <td style="text-align: right; color: #000000;">${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #5BA8FF; font-weight: 600;">Guests:</td>
          <td style="text-align: right; color: #000000;">${guestCount}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #5BA8FF; font-weight: 600;">Date:</td>
          <td style="text-align: right; color: #000000;">${date}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding: 0 30px 30px;">
      <p style="font-size: 15px; color: #000000; line-height: 1.6;">
        Thank you for choosing Bookies. We look forward to hosting you. If you have any questions, feel free to reach out to our support team.
      </p>
      <p style="margin-top: 30px; font-size: 15px; color: #000000;">Warm regards,<br/><strong>The Bookies Team</strong></p>
    </div>

    <div style="background: #f5f5f5; padding: 15px 30px; text-align: center; font-size: 12px; color: #999;">
      © ${new Date().getFullYear()} Bookies. All rights reserved.
    </div>
  </div>
`,
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
