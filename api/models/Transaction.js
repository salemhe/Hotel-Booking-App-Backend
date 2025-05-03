import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  type: { type: String, enum: ["payment", "withdrawal"], required: true },
  amount: { type: Number, required: true },
  reference: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
