const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String, // e.g., "Maintenance", "Salaries"
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Expense', expenseSchema)
