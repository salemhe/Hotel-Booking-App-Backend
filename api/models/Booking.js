import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reservationType: { type: String, enum: ["hotel", "restaurant"], required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: {type: String},
    businessName: { type: String, required: true },
    location: { type: String, required: true },
    room: {
      hotelId: {type: Schema.Types.ObjectId,ref: "Hotel", required: function () { return this.reservationType === "hotel"; }},
      roomNumber: {type: String, required: function () { return this.reservationType === "hotel"; }},
      roomType: {type: String, required: function () { return this.reservationType === "hotel"; }},
      roomPrice: {type: Number, required: function () { return this.reservationType === "hotel"; }},
    },
    checkIn: { type: Date, required: function () { return this.reservationType === "hotel"; } },
    checkOut: { type: Date, required: function () { return this.reservationType === "hotel"; } },
    nights: { type: Number, required: function () { return this.reservationType === "hotel"; } },
    adults: { type: Number},
    children: { type: Number },

  
    meals: [
      {
        restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: function () { return this.reservationType === "restaurant"; } },
        id: { type: Schema.Types.ObjectId, ref: "Menu", required: function () { return this.reservationType === "restaurant"; } },
        name: { type: String, required: function () { return this.reservationType === "restaurant"; } },
        price: { type: Number, required: function () { return this.reservationType === "restaurant"; } },
        quantity: { type: Number, required: function () { return this.reservationType === "restaurant"; } },
        category: {type: String, required: function () { return this.reservationType === "restaurant"; },
          enum: ["Appetizer", "Main Course", "Dessert", "Drinks"],
        },
      },
    ],
    date: { type: Date, required: function () { return this.reservationType === "restaurant"; } },
    time: { type: String, required: function () { return this.reservationType === "restaurant"; } },
    specialOccasion: {type: String,
      enum: ["birthday", "casual", "anniversary", "business", "other"],
      default: "other",
    },
    seatingPreference: {type: String,required: function () { return this.reservationType === "restaurant"; },
      enum: ["indoor", "outdoor", "no-preference"],
      default: "no-preference",
    },
    image: { type: String },
    
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    specialRequest: { type: String },
    reservationDate: { type: Date, default: Date.now },
    reservationStatus: {type: String,
      enum: ["pending", "confirmed", "updated", "cancelled"],
      default: "pending",
    },
    paymentStatus: {type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending",
    },
    paymentMethod: { type: String},
    confirmationCode: {type: String, unique: true},
  },
  { timestamps: true }
);

// Generates a unique confirmation code before saving
bookingSchema.pre("save", async function (next) {
  if (!this.confirmationCode) {
    // Generate a random confirmation code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.confirmationCode = `RES-${code}`;
  }
  next();
});

const Booking = model("Booking", bookingSchema);
export default Booking;
