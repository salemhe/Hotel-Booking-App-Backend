import express from "express";
import { addVendor, getVendors } from "../controllers/vendorController.js";
import { authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", addVendor);

router.get("/", getVendors);

export default router;
