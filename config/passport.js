import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/User.js"; // Adjust the path as per your folder structure
import Vendor from "../models/Vendor.js";

export default (passport) => {
  // User Login Strategy
  passport.use(
    "user-login",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) return done(null, false, { message: "User not found." });

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch)
            return done(null, false, { message: "Invalid credentials." });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Vendor Login Strategy
  passport.use(
    "vendor-login",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const vendor = await Vendor.findOne({ email });
          if (!vendor)
            return done(null, false, { message: "Vendor not found." });

          const isMatch = await bcrypt.compare(password, vendor.password);
          if (!isMatch)
            return done(null, false, { message: "Invalid credentials." });

          return done(null, vendor);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Serialize User
  passport.serializeUser((entity, done) => {
    done(null, { id: entity.id, type: entity.constructor.modelName });
  });

  // Deserialize User
  passport.deserializeUser(async ({ id, type }, done) => {
    try {
      const Model = type === "User" ? User : Vendor;
      const entity = await Model.findById(id);
      done(null, entity);
    } catch (err) {
      done(err);
    }
  });
};
