import { Schema, model } from "mongoose";

const RoomSchema = new Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['single', 'double', 'twin', 'deluxe', 'suite', 'presidential'],
    default: 'single'
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: 0
  }, 
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    default: 1,
    min: 1
  },
  features: [{
    type: String,
    trim: true
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  roomImages: [{
    type: String,
    trim: true
  }],
  roomDescription: {
    type: String,
    required: [true, 'Room description is required'],
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  maintenanceStatus: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'cleaning'],
    default: 'available'
  }
}, { timestamps: true });




const HotelSchema = new Schema({
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User", // adjust if needed
      required: true,
      unique: true,
    },
  businessDescription: {
    type: String,
    required: [true, 'Hotel description is required'],
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
  closeTime: {
    type: String,
    required: true,
  },
  profileImages: [{
    type: String,
    trim: true
  }],
  rooms: [RoomSchema],
  reservations: [{
    type: Schema.Types.ObjectId,
    ref: 'Reservation'
  }],
  reviews: [{
    type:  Schema.Types.ObjectId,
    ref: 'Review'
  }],
  stars: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  chain: {
    type: Schema.Types.ObjectId,
    ref: 'Chain'
  },
  location_id: {
    type: Schema.Types.ObjectId,
    ref: 'Location'
  }
}, { timestamps: true });

export default model('Hotel', HotelSchema);