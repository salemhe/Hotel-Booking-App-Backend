import Transaction from "../models/Transaction.js";
import Vendor from "../models/Vendor.js";

// GET /api/payments?vendorId={vendorId}
export const getPaymentsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.query;
    if (!vendorId) {
      return res.status(400).json({ message: "vendorId query parameter is required" });
    }
    // Optionally, check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    const payments = await Transaction.find({ vendorId })
      .select("_id payer branch amount status createdAt")
      .lean();
    // Format response to match example
    const formatted = payments.map(p => ({
      id: p._id,
      payer: p.payer || "-",
      branch: p.branch || "-",
      amount: p.amount,
      status: p.status,
      date: p.createdAt ? p.createdAt.toISOString().slice(0, 10) : null
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching payments", error: err.message });
  }
};
