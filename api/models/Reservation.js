import mongoose from "mongoose";


const ReservationSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  room: {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    roomNumber: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  guest: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  adults: {
    type: Number,
    required: true,
    default: 1
  },
  children: {
    type: Number,
    default: 0
  },
  specialRequests: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'pending'
  },
  confirmationCode: {
    type: String,
    unique: true
  }
}, { timestamps: true });

// Generate a unique confirmation code before saving
ReservationSchema.pre('save', async function(next) {
  if (!this.confirmationCode) {
    // Generate a random confirmation code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.confirmationCode = `RES-${code}`;
  }
  next();
});

export default mongoose.model('Reservation', ReservationSchema);