import Vendor from "../models/Vendor.js";

export const initializePayment = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No User ID found" });
    }

    const { amount, email, vendorId, bookingId } = req.body;

    if (!amount || !email || !vendorId || !bookingId) {
      return res
        .status(400)
        .json({ message: "Amount and email are required." });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "Paystack secret key not configured." });
    }

    // const paymentData = {
    //   amount: amount * 100, // Paystack expects the amount in kobo
    //   email: email,
    //   currency: "NGN",
    // };
    console.log("Vendor ID:", vendorId);
    const vendor = await Vendor.findById(vendorId);
    if (!vendor || !vendor.paymentDetails || !vendor.paymentDetails.subaccountCode) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    const paymentData = {
      email: email,
      amount: amount * 100, 
      currency: "NGN",
      subaccount: vendor.paymentDetails.subaccountCode, // vendor's subaccount
      percentage_charge: vendor.paymentDetails.percentageCharge,
      callback_url: `https://hotel-booking-application-git-main-salem-hs-projects.vercel.app/confirmation/${bookingId}`,
      metadata: {
        vendorId,
        bookingId
      }
    }
    

    const createPaymentOnPaystack = async (data) => {
      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const responseData = await response.json();
      return responseData;
    };

    const paystackResponse = await createPaymentOnPaystack(paymentData);

    if (paystackResponse.status === false) {
      return res.status(500).json({ message: paystackResponse.message });
    }

    res
      .status(200)
      .json({
        messaage: "success",
        data: {
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          ref: paystackResponse.data.reference,
        },
      });
  } catch (error) {
    console.error("Error Initializing Payment:", error);

    res.status(500).json({
      message: "Error Verifying Payment",
      error: error.message || "Unknown server error",
    });
  }
};
