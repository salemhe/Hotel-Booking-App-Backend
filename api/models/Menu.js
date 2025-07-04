import { Schema, model } from "mongoose";

const MenuSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    addOns: [{ type: String }],
    availabilityStatus: { type: Boolean, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Appetizer", "Main Course", "Dessert", "Drinks"],
    },
    cuisineType: { type: String, required: true },
    dietaryInfo: [{ type: String }],
    discountPrice: { type: Number },
    dishName: { type: String, required: true },
    description: { type: String, required: true },
    dishImage: { type: String },
    itemImage: { type: String },
    maxOrderPerCustomer: { type: Number, required: true },
    portionSize: { type: String },
    preparationTime: { type: Number },
    price: { type: Number, required: true },
    spiceLevel: { type: String },
    stockQuantity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model("Menu", MenuSchema);
