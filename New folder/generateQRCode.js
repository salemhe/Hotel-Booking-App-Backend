import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";


export const generateQRCode = async (text) => {
    try {
      const filename = `${uuidv4()}.png`;
      const outputPath = path.join("uploads", filename);
  
      await QRCode.toFile(outputPath, text);
      return filename; // <- return just the string
    } catch (err) {
      throw new Error("Failed to generate QR code");
    }
  };
  