import Transaction from '../models/Transaction.js';
import Vendor from '../models/Vendor.js';

export const getVendorPaymentStats = async (req, res) => {
  try {
    const vendorId = req.vendor;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(startOfWeek.getDate() - 1);

    // Total earnings
    const totalEarnings = await Transaction.aggregate([
      { $match: { vendorId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Earnings last year
    const earningsLastYear = await Transaction.aggregate([
      { $match: { vendorId, status: 'completed', createdAt: { $gte: startOfLastYear, $lte: endOfLastYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Earnings this year
    const earningsThisYear = await Transaction.aggregate([
      { $match: { vendorId, status: 'completed', createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Earnings this week
    const earningsThisWeek = await Transaction.aggregate([
      { $match: { vendorId, status: 'completed', createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Earnings last week
    const earningsLastWeek = await Transaction.aggregate([
      { $match: { vendorId, status: 'completed', createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Completed payments
    const completedPayments = await Transaction.countDocuments({ vendorId, status: 'completed' });
    const completedPaymentsLastWeek = await Transaction.countDocuments({ vendorId, status: 'completed', createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek } });

    // Pending payments
    const pendingPayments = await Transaction.countDocuments({ vendorId, status: 'pending' });
    const pendingPaymentsLastWeek = await Transaction.countDocuments({ vendorId, status: 'pending', createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek } });

    // Available balance (from Vendor model)
    const vendor = await Vendor.findById(vendorId);
    const availableBalance = vendor?.paymentDetails?.availableBalance || 0;

    // Last payment processed
    const lastPayment = await Transaction.findOne({ vendorId, status: 'completed' }).sort({ createdAt: -1 });
    const lastPaymentProcessed = lastPayment ? lastPayment.createdAt.toISOString() : null;

    // Chart data (monthly earnings for current year)
    const chartAgg = await Transaction.aggregate([
      { $match: { vendorId, status: 'completed', createdAt: { $gte: startOfYear } } },
      { $group: {
        _id: { $month: '$createdAt' },
        value: { $sum: '$amount' }
      } },
      { $sort: { '_id': 1 } }
    ]);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthNames.map((name, idx) => {
      const found = chartAgg.find(m => m._id === idx + 1);
      return { name, value: found ? found.value : 0 };
    });

    // Calculate percentage changes
    const percent = (curr, prev) => {
      if (prev === 0) return curr === 0 ? '0%' : '+100%';
      const diff = ((curr - prev) / prev) * 100;
      return (diff >= 0 ? '+' : '') + diff.toFixed(0) + '%';
    };

    res.json({
      totalEarnings: totalEarnings[0]?.total || 0,
      earningsVsLastYear: percent(earningsThisYear[0]?.total || 0, earningsLastYear[0]?.total || 0),
      earningsThisWeek: earningsThisWeek[0]?.total || 0,
      earningsVsLastWeek: percent(earningsThisWeek[0]?.total || 0, earningsLastWeek[0]?.total || 0),
      completedPayments,
      completedVsLastWeek: percent(completedPayments, completedPaymentsLastWeek),
      pendingPayments,
      pendingVsLastWeek: percent(pendingPayments, pendingPaymentsLastWeek),
      availableBalance,
      lastPaymentProcessed,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment stats', error: error.message });
  }
};
