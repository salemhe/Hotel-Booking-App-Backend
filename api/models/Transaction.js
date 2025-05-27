import { Schema, model } from "mongoose";

const TransactionSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  amount: { type: Number, required: true },
  totalAmount: { type: Number },
  commision: { type: Number },
  reference: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
  transactionCode: { type: String },
});

export default model("Transaction", TransactionSchema);
