import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Booking from "../models/Booking.js";

export const getMetrics = async (req, res) => {
  try {
    const response = await fetch("https://api.paystack.co/balance", {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paystackResponse = await response.json();
    const balances = paystackResponse.data[0].balance / 100;
    const totalVendors = await Vendor.countDocuments();
    const totalUsers = await User.countDocuments();
    const data = await Booking.aggregate([
      {
        $match: {
          status: "confirmed",
        },
      },
      {
        $group: {
          _id: null,
          grossSales: { $sum: "$totalAmount" },
          crossSales: { $sum: "$addOns" },
          netSales: {
            $sum: { $multiply: ["$totalAmount", "$platformPercentage"] },
          },
          totalBookings: { $sum: 1 },
        },
      },
    ]);
    if (data[0]) {
      data[0].totalVendors = totalVendors;
      data[0].totalUsers = totalUsers;
      data[0].balances = balances;
    } else {
      data[0] = {
        grossSales: 0,
        netSales: 0,
        crossSales: 0,
        totalBookings: 0,
        totalVendors: totalVendors,
        totalUsers: totalUsers,
        balances: balances,
      };
    }
    const result = data[0] || {
      grossSales: 0,
      netSales: 0,
      crossSales: 0,
      totalBookings: 0,
      totalVendors: 0,
      totalUsers: 0,
      balances: 0,
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching financials:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
