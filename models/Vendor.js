import { Schema, model } from "mongoose";

const VendorSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    services: { type: [String], default: [] }, // List of services the vendor provides
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model("Vendor", VendorSchema);
