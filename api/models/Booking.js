import {Schema, model} from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["hotel", "restaurant"], required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    menuId: { type: Schema.Types.ObjectId, ref: "Menu", required: function () { return this.type === "restaurant"; } },
    roomNumber: { type: Number, required: function () { return this.type === "hotel"; } }, 
    tableNumber: { type: Number, required: function () { return this.type === "restaurant"; } }, 
    guests: { type: Number, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required:true }, 
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "confirmed", "updated", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

const Booking = model("Booking", bookingSchema);
export default Booking;
