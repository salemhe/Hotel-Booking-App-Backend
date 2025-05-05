import Vendor from '../../models/Vendor.js'; 
import fetch from "node-fetch";
import Transaction from '../../models/Transaction.js';

export const createPaymentDetails = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ message: "Paystack secret key not configured." });
  }

  const { businessName, bankCode, accountNumber, percentageCharge } = req.body;

  if (!businessName || !bankCode || !accountNumber || !percentageCharge) {
    return res.status(400).json({ message: "All account details are required." });
  }

  if (!req.user || !req.user.vendorId) {
    return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
  }

  const vendorId = req.user.vendorId;

  try {

    const subAccountPayload = {
      business_name: businessName,
      settlement_bank: bankCode,
      account_number: accountNumber,
      percentage_charge: Number(percentageCharge),
    };
    
    const subaccountResponse = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      
      body: JSON.stringify(subAccountPayload),
    });

    const subaccountData = await subaccountResponse.json();
    if (!subaccountResponse.ok || subaccountData.status === false) {
      console.error("Subaccount Error:", subaccountData);
      return res.status(500).json({
        message: "Failed to create subaccount.",
        error: subaccountData.message || "Unknown error",
      });
    }


    // Create a recipient for the vendor
    // The recipient is like the vendor's bank account where funds will be transferred
    const recipientPayload = {
      type: "nuban",
      name: businessName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    };

    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipientPayload),
    });

    const recipientData = await recipientResponse.json();
    if (!recipientResponse.ok || recipientData.status === false) {
      console.error("Recipient Error:", recipientData);
      return res.status(500).json({
        message: "Failed to create recipient.",
        error: recipientData.message || "Unknown error",
      });
    }

//get split Group
    // const getSplitGroup = await fetch("https://api.paystack.co/split", {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    //     "Content-Type": "application/json",
    //   },
      
    // })
    // const splitGroupData = await getSplitGroup.json()
    // const gottenSplitGroupId =splitGroupData.data[0].id

    //=================================================================

    // Create a split group for the vendor
    const splitGroupPayload = {
      name: `${businessName} Split Group`,
      type: "percentage",
      currency: "NGN",
      subaccounts: [
        {
          subaccount: subaccountData.data.subaccount_code,
          share: 100 - percentageCharge,
        },
      ],
    };

    const splitGroupResponse = await fetch("https://api.paystack.co/split", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(splitGroupPayload),
    });

    const splitGroupDataResponse = await splitGroupResponse.json();
    

    if (!splitGroupResponse.ok || splitGroupDataResponse.status === false) {
      console.error("Split Group Error:", splitGroupDataResponse);
      return res.status(500).json({
        message: "Failed to create split group.",
        error: splitGroupDataResponse.message || "Unknown error",
      });
    }

    // Add the vendor's subaccount to the split group

    // const addSubaccountToSplitPayload ={
    //   subaccount: subaccountData.data.subaccount_code, 
    //   share: Number(percentageCharge)
    // }

    // const addSubaccountToSplitResponse = await fetch(`https://api.paystack.co/split/${splitGroupId}/subaccount/add`,{
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(addSubaccountToSplitPayload),
    // })

    // const addSubaccountToSplitData = await addSubaccountToSplitResponse.json()
    // if (!addSubaccountToSplitResponse.ok || addSubaccountToSplitData.status === false) {
    //   console.error("Recipient Error:", addSubaccountToSplitData);
    //   return res.status(500).json({
    //     message: "Failed to add subaccount to split group.",
    //     error: addSubaccountToSplitData.message || "Unknown error",
    //   });
    // }


    //=========================================================
  
    // Update the vendor with the payment details
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        paymentDetails: {
          bankAccountName: subaccountData.data.account_name,
          bankName: subaccountData.data.settlement_bank,
          bankCode: bankCode,
          accountNumber: subaccountData.data.account_number,
          paystackSubAccount: subaccountData.data.subaccount_code,
          recipientCode: recipientData.data.recipient_code,
          percentageCharge: subaccountData.data.percentage_charge,
        },
      },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    res.status(201).json({
      message: "Payment details added successfully.",
      data: {
        bankAccountName: subaccountData.data.account_name,
        bankName: subaccountData.data.settlement_bank,
        bankCode: bankCode,
        accountNumber: subaccountData.data.account_number,
        paystackSubAccount: subaccountData.data.subaccount_code,
        recipientCode: recipientData.data.recipient_code,
        percentageCharge: subaccountData.data.percentage_charge,
        splitGroupId: splitGroupDataResponse.data.id,
        split_code: splitGroupDataResponse.data.split_code,
        splitGroupName: splitGroupDataResponse.data.name,
      }
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      message: "An error occurred while setting up payment details.",
      error: error.message || "Unknown server error",
    });
  }
};
