import Transaction from "../models/Transaction.js";
import Booking from "../models/Booking.js";

export const verifyPayment = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  const userId = req.user?.id;
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No User ID found" });
    }

    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: "Reference is required." });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "Paystack secret key not configured." });
    }

    const verifyPaymentOnPaystack = async (reference) => {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const responseData = await response.json();
      return responseData;
    };

    const paystackResponse = await verifyPaymentOnPaystack(reference);

    if (paystackResponse.status === false) {
      return res.status(500).json({ message: paystackResponse.message });
    }

    // res.status(200).json({message: "Succesful", data: paystackResponse.data});

    const transaction = paystackResponse.data;
    if (transaction.status !== "success") {
      return res.status(400).json({ message: "Payment not successful." });
    }

    if (userId !== transaction.metadata.userId) {
      return res
        .status(400)
        .json({ message: "Unauthorized: User Id is missing from metadata" });
    }

    const vendorId = transaction.metadata?.vendorId;
    if (!vendorId) {
      return res
        .status(400)
        .json({ message: "vendor ID is missing from metadata." });
    }

    const existingTransaction = await Transaction.findOne({ reference });

    if (transaction.status === "success" && !existingTransaction) {

      const newTransactionRecord = new Transaction({
        userId: transaction.metadata.userId,
        vendorId: transaction.metadata.vendorId,
        bookingId: transaction.metadata.bookingId,
        type: "payment",
        amount: transaction.amount, 
        // totalAmount: transaction.metadata.total,
        // commision: transaction.metadata.total - transaction.metadata.amount,
        reference: reference,
        status: "success",
      });

      await newTransactionRecord.save();
    }

    const booking = await Booking.findById(transaction.metadata.bookingId)

    // Log or save split details if needed
    return res.status(200).json({
      message: "Transaction verified",
      status: transaction.status,
      transactionId: transaction.id,
      amount: transaction.metadata.amount,
      currency: transaction.currency,
      paid_at: transaction.paid_at,
      userId: transaction.metadata.userId,
      bookingId: transaction.metadata.bookingId,
      vendorId: transaction.metadata.vendorId,
      cerated_at: transaction.created_at,
      channel: transaction.channel,
      customer: {
        id: transaction.customer.id,
        email: transaction.customer.email,
        customer_code: transaction.customer.customer_code,
      },
      booking
    });
  } catch (error) {
    console.error("Error Verifying Payment:", error);

    res.status(500).json({
      message: "Error Verifying Payment",
      error: error.message || "Unknown server error",
    });
  }
};
