import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // adjust if needed
    required: true,
    unique: true,
  },
  openingTime: {
    type: String,
    required: true,
  },
  closingTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  priceRange: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
}, {
  timestamps: true,
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
