import express from "express";
import { body } from "express-validator";
import { addVendor, getVendors, loginVendor } from "../controllers/vendorController.js";
import { authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

const validation = [
  body("firstName").notEmpty().withMessage("First name is required."),
  body("lastName").notEmpty().withMessage("Last name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

router.post("/register",validation, addVendor);

router.post("/login",
  [
    body("email").isEmail().withMessage("Valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  loginVendor
);

router.get("/",authorize, getVendors);

export default router;
