import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();



export const loginVendor = (req, res, next) => {
  passport.authenticate("vendor-login",{ session: false },
    (err, vendor, info) => {
      if (err || !vendor) {
        return res
          .status(400)
          .json({ message: info ? info.message : "Login failed." });
      }

      const token = jwt.sign({ id: vendor.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      const vendorProfile = {
        id: vendor.id,
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        email: vendor.email,
        address: vendor.address,
        branch: vendor.branch,
        profileImage: vendor.profileImage,
        role: vendor.role,
        services: vendor.services,
        paymentDetails: vendor.paymentDetails,
        token: token,
      }
      res.status(200).json({ message: "Login successful.", profile: vendorProfile,  });
    }
  )(req, res, next);
};


