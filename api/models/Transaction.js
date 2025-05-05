
import { Schema, model } from "mongoose";

const TransactionSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["payment", "withdrawal"], required: true },
  amount: { type: Number, required: true },
  reference: {type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default model("Transaction", TransactionSchema);

