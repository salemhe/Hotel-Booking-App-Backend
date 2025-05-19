import express from "express";
import { authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new expense
router.post('/create', authorize, async (req, res) => {
  try {
    const Expense = (await import('../models/Expense.js')).default;
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get expense by ID
router.get('/:id', authorize, async (req, res) => {
  try {
    const Expense = (await import('../models/Expense.js')).default;
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense by ID
router.put('/:id', authorize, async (req, res) => {
  try {
    const Expense = (await import('../models/Expense.js')).default;
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete expense by ID
router.delete('/:id', authorize, async (req, res) => {
  try {
    const Expense = (await import('../models/Expense.js')).default;
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
