import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Transaction from "../models/Transaction.js";

// Dashboard statistics
export const getStats = async (req, res) => {
  try {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get vendor or hotel ID from authenticated user
    const vendorId = req.user?.vendor || req.user?._id;
    
    // Find reservations for today
    const reservationsToday = await Reservation.countDocuments({
      vendor: vendorId,
      checkInDate: { $gte: today, $lt: tomorrow }
    });

    // Find prepaid reservations
    const prepaidReservations = await Reservation.countDocuments({
      vendor: vendorId,
      checkInDate: { $gte: today, $lt: tomorrow },
      paymentStatus: "paid"
    });

    // Calculate expected guests
    const guestsData = await Reservation.aggregate([
      { 
        $match: { 
          vendor: vendorId,
          checkInDate: { $gte: today, $lt: tomorrow } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalGuests: { $sum: "$adults" } 
        } 
      }
    ]);
    const expectedGuests = guestsData[0]?.totalGuests || 0;

    // Calculate pending payments
    const paymentsData = await Reservation.aggregate([
      { 
        $match: { 
          vendor: vendorId,
          paymentStatus: "pending" 
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalAmount: { $sum: "$totalAmount" } 
        } 
      }
    ]);
    const pendingPayments = paymentsData[0]?.totalAmount || 0;

    // Get last week's data to calculate trends
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekTomorrow = new Date(lastWeek);
    lastWeekTomorrow.setDate(lastWeek.getDate() + 1);

    // Last week's reservations
    const lastWeekReservations = await Reservation.countDocuments({
      vendor: vendorId,
      checkInDate: { $gte: lastWeek, $lt: lastWeekTomorrow }
    });

    // Last week's prepaid reservations
    const lastWeekPrepaid = await Reservation.countDocuments({
      vendor: vendorId,
      checkInDate: { $gte: lastWeek, $lt: lastWeekTomorrow },
      paymentStatus: "paid"
    });

    // Last week's guests
    const lastWeekGuestsData = await Reservation.aggregate([
      { 
        $match: { 
          vendor: vendorId,
          checkInDate: { $gte: lastWeek, $lt: lastWeekTomorrow } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalGuests: { $sum: "$adults" } 
        } 
      }
    ]);
    const lastWeekGuests = lastWeekGuestsData[0]?.totalGuests || 0;

    // Last week's pending payments
    const lastWeekPaymentsData = await Reservation.aggregate([
      { 
        $match: { 
          vendor: vendorId,
          paymentStatus: "pending",
          createdAt: { $gte: lastWeek, $lt: today }
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalAmount: { $sum: "$totalAmount" } 
        } 
      }
    ]);
    const lastWeekPendingPayments = lastWeekPaymentsData[0]?.totalAmount || 0;

    // Calculate trends (percent change)
    const reservationsTrend = lastWeekReservations > 0 
      ? Math.round(((reservationsToday - lastWeekReservations) / lastWeekReservations) * 100) 
      : 0;
    const prepaidTrend = lastWeekPrepaid > 0 
      ? Math.round(((prepaidReservations - lastWeekPrepaid) / lastWeekPrepaid) * 100) 
      : 0;
    const guestsTrend = lastWeekGuests > 0 
      ? Math.round(((expectedGuests - lastWeekGuests) / lastWeekGuests) * 100) 
      : 0;
    const pendingPaymentsTrend = lastWeekPendingPayments > 0 
      ? Math.round(((pendingPayments - lastWeekPendingPayments) / lastWeekPendingPayments) * 100) 
      : 0;

    res.json({
      reservationsToday,
      prepaidReservations,
      expectedGuests,
      pendingPayments: parseFloat(pendingPayments.toFixed(2)),
      reservationsTrend,
      prepaidTrend,
      guestsTrend,
      pendingPaymentsTrend
    });
    
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics", error: error.message });
  }
};

// Today's reservations
export const getTodayReservations = async (req, res) => {
  try {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get vendor or hotel ID from authenticated user
    const vendorId = req.user?.vendor || req.user?._id;
    
    // Find today's reservations
    const reservations = await Reservation.find({
      vendor: vendorId,
      checkInDate: { $gte: today, $lt: tomorrow }
    }).populate('guest.user', 'name email avatar');

    // Format the response
    const formattedReservations = reservations.map(reservation => {
      const guest = reservation.guest || {};
      const user = guest.user || {};
      
      return {
        id: reservation._id,
        customerName: guest.name || user.name || "Guest",
        customerInitials: getInitials(guest.name || user.name || "Guest"),
        customerAvatar: user.avatar || null,
        date: reservation.checkInDate,
        time: formatTime(reservation.checkInDate),
        guests: reservation.adults,
        status: reservation.status || "Upcoming"
      };
    });

    res.json(formattedReservations);
    
  } catch (error) {
    console.error("Error fetching today's reservations:", error);
    res.status(500).json({ message: "Error fetching today's reservations", error: error.message });
  }
};

// Weekly trends
export const getTrends = async (req, res) => {
  try {
    const { period = "weekly" } = req.query;
    // Get vendor or hotel ID from authenticated user
    const vendorId = req.user?.vendor || req.user?._id;
    
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set start date based on period
    let startDate;
    if (period === "weekly") {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "monthly") {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7); // Default to weekly
    }

    // Generate chart data
    const chartData = [];
    
    // For weekly, get data for each day of the week
    if (period === "weekly") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = today.getDay();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayIndex = date.getDay();
        
        // Query for reservations, revenue, and guests on this day
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const reservations = await Reservation.countDocuments({
          vendor: vendorId,
          checkInDate: { $gte: dayStart, $lte: dayEnd }
        });
        
        const revenue = await Reservation.aggregate([
          { 
            $match: { 
              vendor: vendorId,
              checkInDate: { $gte: dayStart, $lte: dayEnd },
              paymentStatus: "paid"
            } 
          },
          { 
            $group: { 
              _id: null, 
              total: { $sum: "$totalAmount" } 
            } 
          }
        ]);
        
        const guests = await Reservation.aggregate([
          { 
            $match: { 
              vendor: vendorId,
              checkInDate: { $gte: dayStart, $lte: dayEnd } 
            } 
          },
          { 
            $group: { 
              _id: null, 
              total: { $sum: "$adults" } 
            } 
          }
        ]);
        
        chartData.push({
          day: days[dayIndex],
          value1: reservations, // Reservations
          value2: revenue[0]?.total || 0, // Revenue
          value3: guests[0]?.total || 0 // Guests
        });
      }
    }
    
    res.json({ chartData });
    
  } catch (error) {
    console.error("Error fetching trends:", error);
    res.status(500).json({ message: "Error fetching trends", error: error.message });
  }
};

// Customer frequency
export const getCustomerFrequency = async (req, res) => {
  try {
    const { period = "weekly" } = req.query;
    // Get vendor or hotel ID from authenticated user
    const vendorId = req.user?.vendor || req.user?._id;
    
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set start date based on period
    let startDate;
    if (period === "weekly") {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "monthly") {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7); // Default to weekly
    }

    // Get all reservations for this period
    const reservations = await Reservation.find({
      vendor: vendorId,
      checkInDate: { $gte: startDate, $lte: today }
    }).populate('guest.user');

    // Get unique customer IDs
    const customerIds = new Set();
    reservations.forEach(reservation => {
      if (reservation.guest?.user?._id) {
        customerIds.add(reservation.guest.user._id.toString());
      }
    });

    // Find returning customers (those who had reservations before this period)
    const previousCustomers = await Reservation.find({
      vendor: vendorId,
      checkInDate: { $lt: startDate },
      'guest.user': { $in: Array.from(customerIds) }
    }).distinct('guest.user');

    const returningCustomers = previousCustomers.length;
    const totalCustomers = customerIds.size;
    const newCustomers = totalCustomers - returningCustomers;

    res.json({
      newCustomers,
      returningCustomers,
      totalCustomers
    });
    
  } catch (error) {
    console.error("Error fetching customer frequency:", error);
    res.status(500).json({ message: "Error fetching customer frequency", error: error.message });
  }
};

// Revenue by category
export const getRevenueByCategory = async (req, res) => {
  try {
    const { period = "weekly" } = req.query;
    // Get vendor or hotel ID from authenticated user
    const vendorId = req.user?.vendor || req.user?._id;
    
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set start date based on period
    let startDate;
    if (period === "weekly") {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "monthly") {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7); // Default to weekly
    }

    // Define categories with colors
    const categoryColors = {
      "Room Booking": "bg-teal-600",
      "Food & Beverage": "bg-red-500",
      "Spa & Wellness": "bg-blue-500",
      "Events": "bg-amber-500",
      "Other": "bg-gray-500"
    };

    // Get transactions grouped by category
    const categoryRevenue = await Transaction.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: "successful",
          createdAt: { $gte: startDate, $lte: today }
        }
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" }
        }
      }
    ]);

    // Calculate total revenue
    const totalRevenue = categoryRevenue.reduce((sum, category) => sum + category.amount, 0);

    // Format the response
    const categories = categoryRevenue.map(category => {
      const categoryName = category._id || "Other";
      const amount = category.amount;
      const percentage = totalRevenue > 0 ? parseFloat(((amount / totalRevenue) * 100).toFixed(1)) : 0;
      
      return {
        name: categoryName,
        percentage,
        amount,
        color: categoryColors[categoryName] || "bg-gray-500"
      };
    });

    // If no data, provide sample data
    if (categories.length === 0) {
      categories.push(
        { name: "Room Booking", percentage: 50, amount: 110000, color: "bg-teal-600" },
        { name: "Food & Beverage", percentage: 22.7, amount: 50000, color: "bg-red-500" },
        { name: "Spa & Wellness", percentage: 13.6, amount: 30000, color: "bg-blue-500" },
        { name: "Events", percentage: 9.1, amount: 20000, color: "bg-amber-500" },
        { name: "Other", percentage: 4.6, amount: 10000, color: "bg-gray-500" }
      );
    }

    res.json({ categories });
    
  } catch (error) {
    console.error("Error fetching revenue by category:", error);
    res.status(500).json({ message: "Error fetching revenue by category", error: error.message });
  }
};

// Reservation sources
export const getReservationSources = async (req, res) => {
  try {
    const { period = "weekly" } = req.query;
    // Get vendor or hotel ID from authenticated user
    const vendorId = req.user?.vendor || req.user?._id;
    
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Set start date based on period
    let startDate;
    if (period === "weekly") {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "monthly") {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7); // Default to weekly
    }

    // Get reservations grouped by source
    const sourcesData = await Reservation.aggregate([
      {
        $match: {
          vendor: vendorId,
          createdAt: { $gte: startDate, $lte: today }
        }
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total reservations
    const total = sourcesData.reduce((sum, source) => sum + source.count, 0);

    // Format the response
    let website = 0;
    let mobile = 0;
    let walkIn = 0;

    sourcesData.forEach(source => {
      if (source._id === "website") {
        website = source.count;
      } else if (source._id === "mobile") {
        mobile = source.count;
      } else if (source._id === "walk-in") {
        walkIn = source.count;
      }
    });

    // Calculate percentages
    const websitePercent = total > 0 ? Math.round((website / total) * 100) : 0;
    const mobilePercent = total > 0 ? Math.round((mobile / total) * 100) : 0;
    const walkInPercent = total > 0 ? Math.round((walkIn / total) * 100) : 0;

    // If no data, provide sample data
    if (total === 0) {
      res.json({
        website: 50,
        mobile: 30,
        walkIn: 20,
        total: 100
      });
    } else {
      res.json({
        website: websitePercent,
        mobile: mobilePercent,
        walkIn: walkInPercent,
        total: 100
      });
    }
    
  } catch (error) {
    console.error("Error fetching reservation sources:", error);
    res.status(500).json({ message: "Error fetching reservation sources", error: error.message });
  }
};

// Get all branches
export const getAllBranches = async (req, res) => {
  try {
    // Get vendor ID from authenticated user
    const vendorId = req.user?.vendor || req.user?._id;
    
    // Find all branches for this vendor
    const branches = await Hotel.find({ owner: vendorId })
      .select('name location address phone email status');
    
    res.json(branches);
    
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Error fetching branches", error: error.message });
  }
};

// Helper functions
function getInitials(name) {
  if (!name) return "G";
  
  const names = name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

function formatTime(date) {
  if (!date) return "";
  
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return hours + ':' + minutesStr + ' ' + ampm;
}