// api/models/Vendor.js
import { Schema, model } from "mongoose";

const withdrawalSchema = new Schema({
  amount: { type: Number, required: true },
  total: { type: Number, required: true },
  fee: { type: Number, required: true },
  reference: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  transactionCode: { type: String, required: true },
});

const VendorSchema = new Schema(
  {
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    businessDescription: { type: String },
    email: { type: String, required: true, unique: true },
    openingTime: { type: String },
    closingTime: { type: String },
    cuisines: [{ type: String }],
    phone: { type: String },
    address: { type: String },
    branch: { type: String },
    password: { type: String },
    role: { type: String },
    profileImages: [
      {
        id: { type: String },
        url: {
          type: String,
          validate: {
            validator: function (value) {
              return (
                /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/.test(value) ||
                value === null
              );
            },
            message: "Profile image must be a valid URL.",
          },
          default: null,
        },
      },
    ],
    services: { type: [String], default: [] }, // List of services the vendor provides

    paymentDetails: {
      bankAccountName: { type: String },
      bankName: { type: String },
      bankCode: { type: String },
      accountNumber: { type: String },
      subaccountCode: { type: String },
    },
    availableSlots: [{ type: String }],
    percentageCharge: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    withdrawals: [withdrawalSchema],
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    onboarded: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    website: { type: String, trim: true },
    priceRange: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Add virtual property to count total withdrawals
VendorSchema.virtual("withdrawalCount").get(function () {
  return this.withdrawals ? this.withdrawals.length : 0;
});

export default model("Vendor", VendorSchema);
