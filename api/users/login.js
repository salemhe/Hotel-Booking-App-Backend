import jwt from "jsonwebtoken";
import passport from "passport";

export const loginUser = (req, res, next) => {
  passport.authenticate("user-login", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ message: info ? info.message : "Login failed." });
    }

    const token = jwt.sign(
      {
        id: newUser._id,
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.status(200).json({ message: "Login successful.", token });
  })(req, res, next);
};
