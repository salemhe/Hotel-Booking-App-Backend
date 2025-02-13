import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema(
  {
    vendor: {type: mongoose.Schema.Types.ObjectId, ref: "Vendor",required: true},
    itemName: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    itemImage: { type: String }, // Optional, store image URL
  },
  { timestamps: true }
);

export default mongoose.model("Menu", MenuSchema);
 