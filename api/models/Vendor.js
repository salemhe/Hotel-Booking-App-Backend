import mongoose from "mongoose";

const paymentDetailsSchema = new mongoose.Schema({
  bankName: String,
  accountNumber: String,
  accountName: String,
  subaccountCode: String,
  recipientCode: String,
  splitCode: String,
});

const withdrawalSchema = new mongoose.Schema({
  amount: Number,
  date: { type: Date, default: Date.now },
  reference: String,
});

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: String,

  // Payment & split details
  paymentDetails: paymentDetailsSchema,

  // Balance and history
  balance: { type: Number, default: 0 },
  withdrawals: [withdrawalSchema],

  // Platform commission per vendor (optional override)
  platformCommission: { type: Number, default: 10 }, // percent
});

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
