import { Schema, model } from "mongoose";

const VendorSchema = new Schema(
  {
   
    businessName: {type: String, required: true},
    businessType: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    branch: { type: String},
    password: { type: String },
    role: { type: String },
    profileImage: { type: String },
    services: { type: [String], default: [] }, // List of services the vendor provides

    paymentDetails: {
      bankAccountName: { type: String},
      bankName: { type: String },
      bankCode: { type: String },
      accountNumber: { type: String },
      paystackSubAccount: { type: String },
      recipientCode: { type: String },
      percentageCharge: { type: Number }
    },
    otp: String, 
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


export default model("Vendor", VendorSchema);
