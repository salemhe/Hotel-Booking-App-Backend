// api/models/Vendor.js
import { Schema, model } from "mongoose";

const withdrawalSchema = new Schema({
  amount: { type: Number, required: true},
  total: { type: Number, required: true},
  fee: { type: Number, required: true},
  reference: { type: String, required: true },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  transactionCode: { type: String, required: true },
});

const VendorSchema = new Schema(
  {
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    branch: { type: String},
    password: { type: String },
    role: { type: String },
    profileImages: [{
      type: String,
      // validate: {
      //   validator: function (value) {
      //     return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/.test(value);
      //   },
      //   message: "Profile image must be a valid URL.",
      // },
      default: null,
    }],
    services: { type: [String], default: [] }, // List of services the vendor provides

    paymentDetails: {
      bankAccountName: { type: String },
      bankName: { type: String },
      bankCode: { type: String },
      accountNumber: { type: String },
      recipientCode: { type: String },
    },
    percentageCharge: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    withdrawals: [withdrawalSchema],
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Add virtual property to count total withdrawals
VendorSchema.virtual('withdrawalCount').get(function() {
  return this.withdrawals ? this.withdrawals.length : 0;
});

export default model("Vendor", VendorSchema);
