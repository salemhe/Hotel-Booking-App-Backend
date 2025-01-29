import express from "express";
import { body } from "express-validator";
import { registerVendor } from "../vendors/register.js";
import { loginVendor } from "../vendors/login.js";
import { getVendors } from "../vendors/getvendors.js";
import { authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

const validation = [
  body("name").notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

router.post("/register", registerVendor);

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
