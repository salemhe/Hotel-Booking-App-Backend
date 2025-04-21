import {Schema, model} from "mongoose";

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // type: { type: String, enum: ["hotel", "restaurant"], required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    businessName: { type: String, required: true },
    location: { type: String, required: true },
    menuId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    partySize: { type: Number, required: true },
    // roomNumber: { type: Number, required: function () { return this.type === "hotel"; } }, 
    tableNumber: { type: Number}, 
    tableType: { type: String, required: true },
    meal: {type: String, required: true },
    pricePerTable: { type: Number,required:true },
    guests: { type: Number },
    totalPrice: { type: Number, required: true },
    specialRequest: { type: String },
    image: { type: String },
    date: { type: Date, required: true },
    // checkIn: { type: Date, required: function () { return this.type === "hotel"; } }, // Only required for hotels
    // checkOut: { type: Date, required: function () { return this.type === "hotel"; } }, // just for hotels
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "confirmed", "updated", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

const Booking = model("Booking", bookingSchema);
export default Booking;
