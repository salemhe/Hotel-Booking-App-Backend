import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  type: {
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
  images: [{
    type: String,
    trim: true
  }],
  description: {
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

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
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
    coordinates: {
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      }
    }
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '12:00'
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  rooms: [RoomSchema],
  reservations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  rating: {
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chain'
  },
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }
}, { timestamps: true });

export default mongoose.model('Hotel', HotelSchema);