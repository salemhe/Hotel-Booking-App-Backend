import express from "express";
import { initializePayment } from "../controllers/payments/initializePayment.js";
import { createPaymentDetails } from "../controllers/payments/createPaymentDetails.js";
import { getWithdrawalHistory } from "../controllers/payments/getWithdrawalHistory.js";
import { withdrawFunds } from "../controllers/payments/withdrawFunds.js";

const router = express.Router();

// 💵 Payment initialization
router.post("/initialize", initializePayment);

// 💳 Create subaccount + recipient + split
router.post("/create-payment-details", createPaymentDetails);

// 📤 Withdraw funds
router.post("/withdraw", withdrawFunds);

// 📁 Get withdrawal history
router.get("/withdrawals", getWithdrawalHistory);

export default router;
