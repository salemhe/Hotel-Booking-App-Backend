// api/models/User.js
import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String },
    otp: String, 
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' }, // Reference to Vendor
    role: { type: String, enum: ['staff', 'customer', 'admin', 'vendor'], default: 'customer' },
  },
  { timestamps: true } 
);

export default model("User", UserSchema);
