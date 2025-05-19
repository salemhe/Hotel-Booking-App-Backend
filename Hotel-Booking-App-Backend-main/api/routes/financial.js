const express = require('express')
const router = express.Router()
const Sale = require('../models/Sale')
const Expense = require('../models/Expense')

// GET /api/financials/summary — returns real-time financial summary
router.get('/summary', async (req, res) => {
  try {
    const sales = await Sale.find()
    const expenses = await Expense.find()

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    const salesOverTime = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    months.forEach((month, i) => {
      const filtered = sales.filter(s => new Date(s.date).getMonth() === i)
      const sum = filtered.reduce((a, b) => a + b.amount, 0)
      salesOverTime.push({ month, sales: sum })
    })

    const sources = {}
    for (let sale of sales) {
      sources[sale.source] = (sources[sale.source] || 0) + sale.amount
    }
    const revenueBreakdown = Object.entries(sources).map(([source, amount]) => ({ source, amount }))

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      salesOverTime,
      revenueBreakdown
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server Error' })
  }
})

module.exports = router
