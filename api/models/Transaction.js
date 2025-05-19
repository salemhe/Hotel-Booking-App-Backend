
import { Schema, model } from "mongoose";

const TransactionSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["payment", "withdrawal"], required: true },
  amount: { type: Number, required: true },
  totalAmount: { type: Number },
  commision: { type: Number }, 
  reference: {type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
  transactionCode: { type: String },
});

export default model("Transaction", TransactionSchema);

