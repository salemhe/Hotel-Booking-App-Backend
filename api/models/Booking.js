import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // type: { type: String, enum: ["hotel", "restaurant"], required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    businessName: { type: String, required: true },
    location: { type: String, required: true },
    // menuId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    // partySize: { type: Number },
    // roomNumber: { type: Number, required: function () { return this.type === "hotel"; } },
    // tableNumber: { type: Number },
    // tableType: { type: String, required: true },
    time: { type: String, required: true },
    meals: [
      {
        id: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    // pricePerTable: { type: Number, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    specialRequest: { type: String },
    specialOccasion: {
      type: String,
      enum: ["birthday", "casual", "anniversary", "business", "other"],
      default: "other",
    },
    seatingPreference: {
      type: String,
      enum: ["indoor", "outdoor", "no-preference"],
      default: "no-preference",
    },
    image: { type: String },
    date: { type: Date, required: true },
    // checkIn: { type: Date }, // Only required for hotels
    // checkOut: { type: Date }, // just for hotels
    // bookingDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "confirmed", "updated", "cancelled"],
      default: "pending",
    },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Booking = model("Booking", bookingSchema);
export default Booking;
