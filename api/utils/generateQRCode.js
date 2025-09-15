import QRCode from "qrcode";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

dotenv.config();
// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateQRCode = async (text) => {
  try {
    // Generate the QR code as a data URL (base64)
    const qrCodeDataUrl = await QRCode.toDataURL(text);

    // Upload the generated QR code to Cloudinary
    const uploadResponse = await cloudinary.v2.uploader.upload(qrCodeDataUrl, {
      folder: "qr-codes",
      public_id: `qr-${Date.now()}`,
      overwrite: true,
    });

    // Return the URL of the uploaded QR code
    return uploadResponse.secure_url;
  } catch (err) {
    throw new Error("Failed to generate and upload QR code");
  }
};

  