import Vendor from "../models/Vendor.js";
import  dotenv from "dotenv";

dotenv.config();

export const updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.vendor?.id;

    if (!vendorId) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const {
      businessName,
      businessType,
      phone,
      address,
      branch,
      role,
      services,
      bankName,
      bankCode,
      accountNumber,
      bankAccountName,
      percentageCharge,
      paystackSubAccount,
    } = req.body;

    const vendorImage = req.file?.filename || null;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Parse services
    let servicesArray = [];
    if (services) {
      try {
        servicesArray = typeof services === "string" ? JSON.parse(services) : services;
        if (!Array.isArray(servicesArray)) throw new Error();
      } catch {
        return res.status(400).json({ message: "Invalid services format. Must be an array or JSON array." });
      }
    }

    // Paystack subaccount update (optional)
    let subaccountUpdateData = null;
    if (paystackSubAccount && (bankCode || accountNumber || percentageCharge || businessName)) {
      const payload = {
        ...(businessName && { business_name: businessName }),
        ...(bankCode && { settlement_bank: bankCode }),
        ...(accountNumber && { account_number: accountNumber }),
        ...(percentageCharge && { percentage_charge: Number(percentageCharge) }),
      };

      const response = await fetch(
        `https://api.paystack.co/subaccount/${paystackSubAccount}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!result.status) {
        return res.status(400).json({ message: "Paystack subaccount update failed", error: result.message });
      }
      subaccountUpdateData = result.data;
    }

    // Update fields if provided
    if (businessName) vendor.businessName = businessName;
    if (businessType) vendor.businessType = businessType;
    if (phone) vendor.phone = phone;
    if (address) vendor.address = address;
    if (branch) vendor.branch = branch;
    if (role) vendor.role = role;
    if (servicesArray.length > 0) vendor.services = servicesArray;

    // Handle profile image
    if (vendorImage) {
      const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
      vendor.profileImage = `${BASE_URL}/uploads/${vendorImage}`;
    }

    // Update payment details conditionally
    vendor.paymentDetails = {
      ...vendor.paymentDetails,
      ...(bankName && { bankName }),
      ...(bankCode && { bankCode }),
      ...(accountNumber && { accountNumber }),
      ...(bankAccountName && { bankAccountName }),
      ...(percentageCharge && { percentageCharge: Number(percentageCharge) }),
      ...(subaccountUpdateData?.subaccount_code && {
        paystackSubAccount: subaccountUpdateData.subaccount_code,
      }),
    };

    await vendor.save();

    res.status(200).json({
      message: "Vendor record updated successfully",
      vendor,
    });

  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
