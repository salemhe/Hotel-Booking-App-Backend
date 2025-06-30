import { Schema, model } from "mongoose";

const MenuSchema = new Schema(
  {
    // vendor: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Vendor",
    //   required: true,
    // },
    addOns: [{ type: String }],
    availabilityStatus: { type: Boolean, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Appetizer", "Main Course", "Dessert", "Drinks", "mainCourse"], // example categories
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

const restaurantSchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User", // adjust if needed
      required: true,
      unique: true,
    },
    businessDescription: {
    type: String,
    required: [true, 'Restaurant description is required'],
    trim: true
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    // coordinates: {
    //   latitude: {
    //     type: Number
    //   },
    //   longitude: {
    //     type: Number
    //   }
    // }
  },
  website: {
    type: String,
    trim: true
  },
  openTime: {
    type: String,
    required: true,
  },
  closeTime: {type: String,required: true,},
  cuisines: [{ type: String }],
  images: [{type: String,},],
  menus: [MenuSchema],
  stars: {type: Number,default: 0,min: 0,max: 5},
  },
  {timestamps: true,}
);

const Restaurant = model("Restaurant", restaurantSchema);

export default Restaurant;
