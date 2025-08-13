import Booking from "../models/Booking.js";
import mongoose from "mongoose";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isoWeek from "dayjs/plugin/isoWeek.js";


dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

export const getBookings = async (req, res) => {
  try {
    const { reservationType, vendorId, userId, bookingId } = req.query;

    let query = {};

    if (reservationType) query.reservationType = reservationType;
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      query.vendorId = new mongoose.Types.ObjectId(vendorId);
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      query._id = new mongoose.Types.ObjectId(bookingId);
    }

  
    const bookings = await Booking.find(query);
    if (!bookings) {
      return res.status(404).json({ message: "No bookings found." });
    }
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings.", error });
  }
};





// export const getVendorDashboardStats = async (req, res) => {
//   try {
//     const { vendorId } = req.params;

//     const today = dayjs().startOf("day");
//     const startOfWeek = today.startOf("week");
//     const endOfWeek = today.endOf("week");
//     const startOfLastWeek = startOfWeek.subtract(1, "week");
//     const endOfLastWeek = endOfWeek.subtract(1, "week");

//     // 1. Fetch current week and last week reservations from DB
//     const [currentWeekReservations, lastWeekReservations] = await Promise.all([
//       Booking.find({
//         vendorId,
//         reservationDate: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
//       }).lean(),
//       Booking.find({
//         vendorId,
//         reservationDate: { $gte: startOfLastWeek.toDate(), $lte: endOfLastWeek.toDate() }
//       }).lean()
//     ]);

//     // 2. Today's reservations
//     const reservationsToday = currentWeekReservations.filter(r =>
//       dayjs(r.reservationDate).isSame(today, "day")
//     );
//     const countToday = reservationsToday.length;

//     // 3. Prepaid reservations today
//     const prepaidToday = reservationsToday.filter(r => r.paymentStatus === "paid").length;

//     // 4. Expected guests today
//     const guestsToday = reservationsToday.reduce((sum, r) => sum + (r.guests || 0), 0);

//     // 5. Pending payments
//     const pendingPayments = currentWeekReservations
//       .filter(r => r.paymentStatus === "pending")
//       .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

//     // 6. Weekly trends
//     const weeklyTrends = Array.from({ length: 7 }, (_, i) => {
//       const day = startOfWeek.add(i, "day");
//       const dayReservations = currentWeekReservations.filter(r =>
//         dayjs(r.reservationDate).isSame(day, "day")
//       );
//       return {
//         day: day.format("ddd"), // Mon, Tue, etc.
//         total: dayReservations.length,
//         prepaid: dayReservations.filter(r => r.paymentStatus === "paid").length,
//         pending: dayReservations.filter(r => r.paymentStatus === "pending").length
//       };
//     });

//     // 7. Percentage change helper
//     const pctChange = (current, prev) => {
//       if (prev === 0) return current > 0 ? 100 : 0;
//       return ((current - prev) / prev) * 100;
//     };

//     // 8. Last week comparison stats
//     const lastWeekTodayCount = lastWeekReservations.filter(r =>
//       dayjs(r.reservationDate).isSame(today.subtract(7, "day"), "day")
//     ).length;

//     const lastWeekPrepaid = lastWeekReservations.filter(
//       r => r.paymentStatus === "paid" &&
//       dayjs(r.reservationDate).isSame(today.subtract(7, "day"), "day")
//     ).length;

//     const lastWeekGuests = lastWeekReservations
//       .filter(r => dayjs(r.reservationDate).isSame(today.subtract(7, "day"), "day"))
//       .reduce((sum, r) => sum + (r.guests || 0), 0);

//     const lastWeekPending = lastWeekReservations
//       .filter(r => r.paymentStatus === "pending")
//       .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

//     // 9. Send response
//     res.json({
//       stats: {
//         reservationsMadeToday: {
//           value: countToday,
//           changePct: pctChange(countToday, lastWeekTodayCount)
//         },
//         prepaidReservations: {
//           value: prepaidToday,
//           changePct: pctChange(prepaidToday, lastWeekPrepaid)
//         },
//         expectedGuestsToday: {
//           value: guestsToday,
//           changePct: pctChange(guestsToday, lastWeekGuests)
//         },
//         pendingPayments: {
//           value: pendingPayments,
//           changePct: pctChange(pendingPayments, lastWeekPending)
//         }
//       },
//       todayReservations: reservationsToday,
//       reservationsTrends: {
//         total: currentWeekReservations.length,
//         changePct: pctChange(
//           currentWeekReservations.length,
//           lastWeekReservations.length
//         ),
//         days: weeklyTrends
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error while fetching dashboard stats" });
//   }
// };

export const getVendorDashboardStats = async (req, res) => {
  // Implementation for fetching vendor dashboard stats

  try {
    const { vendorId } = req.params;

    const today = dayjs().startOf("day");
    const startOfWeek = today.startOf("week");
    const endOfWeek = today.endOf("week");
    const startOfLastWeek = startOfWeek.subtract(1, "week");
    const endOfLastWeek = endOfWeek.subtract(1, "week");

    // Fetch current and last week reservations
    const [currentWeekReservations, lastWeekReservations] = await Promise.all([
      Booking.find({
        vendorId,
        reservationDate: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
      }).lean(),
      Booking.find({
        vendorId,
        reservationDate: { $gte: startOfLastWeek.toDate(), $lte: endOfLastWeek.toDate() }
      }).lean()
    ]);

    // Today's reservations
    const reservationsToday = currentWeekReservations.filter(r =>
      dayjs(r.reservationDate).isSame(today, "day")
    );
    const countToday = reservationsToday.length;
    const prepaidToday = reservationsToday.filter(r => r.paymentStatus === "paid").length;
    const guestsToday = reservationsToday.reduce((sum, r) => sum + (r.guests || 0), 0);
    const pendingPayments = currentWeekReservations
      .filter(r => r.paymentStatus === "pending")
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    //logic for Weekly trends grouped by payment status
    const weeklyTrends = Array.from({ length: 7 }, (_, i) => {
      const day = startOfWeek.add(i, "day");
      const dayReservations = currentWeekReservations.filter(r =>
        dayjs(r.reservationDate).isSame(day, "day")
      );
      const paid = dayReservations.filter(r => r.paymentStatus === "paid").length;
      const pending = dayReservations.filter(r => r.paymentStatus === "pending").length;

      return {
        day: day.format("ddd"), // day format as Mon, Tue, etc.
        total: dayReservations.length,
        paid,
        pending
      };
    });

    // Percentage change helper
    const pctChange = (current, prev) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return ((current - prev) / prev) * 100;
    };

    // Last week stats for comparison
    const lastWeekTodayCount = lastWeekReservations.filter(r =>
      dayjs(r.reservationDate).isSame(today.subtract(7, "day"), "day")
    ).length;

    const lastWeekPrepaid = lastWeekReservations.filter(
      r => r.paymentStatus === "paid" &&
      dayjs(r.reservationDate).isSame(today.subtract(7, "day"), "day")
    ).length;

    const lastWeekGuests = lastWeekReservations
      .filter(r => dayjs(r.reservationDate).isSame(today.subtract(7, "day"), "day"))
      .reduce((sum, r) => sum + (r.guests || 0), 0);

    const lastWeekPending = lastWeekReservations
      .filter(r => r.paymentStatus === "pending")
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    // Response
    res.json({
      stats: {
        reservationsMadeToday: {
          value: countToday,
          changePercentage: pctChange(countToday, lastWeekTodayCount)
        },
        prepaidReservations: {
          value: prepaidToday,
          changePercentage: pctChange(prepaidToday, lastWeekPrepaid)
        },
        expectedGuestsToday: {
          value: guestsToday,
          changePercentage: pctChange(guestsToday, lastWeekGuests)
        },
        pendingPayments: {
          value: pendingPayments,
          changePercentage: pctChange(pendingPayments, lastWeekPending)
        }
      },
      todayReservations: reservationsToday,
      reservationsTrends: {
        total: currentWeekReservations.length,
        changePercentage: pctChange(
          currentWeekReservations.length,
          lastWeekReservations.length
        ),
        days: weeklyTrends //  contains total, paid, pending per day
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching dashboard stats" });
  }
};
