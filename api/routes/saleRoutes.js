import express from "express";
import { authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new sale
router.post('/create', authorize, async (req, res) => {
  try {
    const Sale = (await import('../models/Sale.js')).default;
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get sale by ID
router.get('/:id', authorize, async (req, res) => {
  try {
    const Sale = (await import('../models/Sale.js')).default;
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update sale by ID
router.put('/:id', authorize, async (req, res) => {
  try {
    const Sale = (await import('../models/Sale.js')).default;
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete sale by ID
router.delete('/:id', authorize, async (req, res) => {
  try {
    const Sale = (await import('../models/Sale.js')).default;
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
