import Vendor from "../models/Vendor.js";
import Transaction from '../models/Transaction.js';

export const verifyPayment = async (req, res) => {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const userId = req.user?.id 
    try {
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: "Unauthorized: No User ID found" });
        }

        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({ message: "Reference is required." });
        }

        if (!PAYSTACK_SECRET_KEY) {
            return res.status(500).json({ message: "Paystack secret key not configured." });
        }

        const verifyPaymentOnPaystack = async (reference) => {
            const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            });

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

        const vendorId = transaction.metadata?.vendorId;
        if (!vendorId) {
        return res.status(400).json({ message: "vendor ID is missing from metadata." });
        }


        const vendor = await Vendor.findById(vendorId);
        if (!vendor || !vendor.paymentDetails || !vendor.paymentDetails.paystackSubAccount) {
          return res.status(404).json({ message: "Vendor or payment details not found." });
        }
    
        const subaccount = vendor.paymentDetails.paystackSubAccount;
        const percentage = vendor.paymentDetails.percentageCharge 

        if (transaction.status === "success") {

          const newTransactionRecord = new Transaction({
            user: userId,
            type: "payment",
            amount: paystackResponse.data.amount / 100,
            reference: reference,
            status: "successful",
          });
      
          await newTransactionRecord.save();
      }

    
        // Log or save split details if needed
        return res.status(200).json({
          message: "Transaction verified & split setup exists.",
          status: paystackResponse.data.status,
          transactionId: transaction.id,
          amount: transaction.amount / 100, // Convert from kobo to Naira
          currency: transaction.currency,
          paid_at: paystackResponse.data.paid_at,
          cerated_at: paystackResponse.data.created_at,
          channel: paystackResponse.data.channel,
          customer:{
            id: paystackResponse.data.customer.id,
            email: paystackResponse.data.customer.email,
            customer_code: paystackResponse.data.customer. customer_code,
          },
          subaccount: {
            id: paystackResponse.data.subaccount.id,
            subaccount_code: paystackResponse.data.subaccount.subaccount_code,
            business_name: paystackResponse.data.subaccount.business_name,
            percentage_charge: paystackResponse.data.subaccount.percentage_charge,
            settlement_bank: paystackResponse.data.subaccount.settlement_bank,
            bank_id: paystackResponse.data.subaccount.bank_id,
            account_number: paystackResponse.data.subaccount.account_number,
            active: paystackResponse.data.subaccount.active,
            is_verified: paystackResponse.data.subaccount.is_verified,
         },
          split: {
            vendorPercentage: percentage,
            platformPercentage: 100 - percentage,
            subaccountCode: subaccount,
          },
        });



    } catch (error) {
        console.error("Error Verifying Payment:", error);
    
        res.status(500).json({
          message: "Error Verifying Payment",
          error: error.message || "Unknown server error",
        });
      };
}