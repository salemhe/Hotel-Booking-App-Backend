const mongoose = require('mongoose')

const saleSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  source: {
    type: String, // e.g., "Room Booking", "Food", "Event"
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Sale', saleSchema)
