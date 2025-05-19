const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Event', eventSchema)
