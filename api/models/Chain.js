const mongoose = require('mongoose');

const ChainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chain name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Chain description is required'],
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  locations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  hotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  }],
  restaurants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  website: {
    type: String,
    trim: true
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
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Chain', ChainSchema);