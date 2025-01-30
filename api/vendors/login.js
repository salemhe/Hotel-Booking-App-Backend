import passport from "passport";
import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";

// import Vendor from "../models/Vendor.js";
import bcrypt from "bcrypt";



export const loginVendor = (req, res, next) => {
  passport.authenticate(
    "vendor-login",
    { session: false },
    (err, vendor, info) => {
      if (err || !vendor) {
        return res
          .status(400)
          .json({ message: info ? info.message : "Login failed." });
      }

      const token = jwt.sign({ id: vendor.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ message: "Login successful.", token });
    }
  )(req, res, next);
};


