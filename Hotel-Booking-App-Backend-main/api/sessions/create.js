
import Session from "../models/Session.js"

export const createSession = async (req, res) => {
  try {
    const { userId, token, ipAddress, device, expiresAt } = req.body;

    const newSession = new Session({
      userId,
      token,
      ipAddress,
      device,
      expiresAt,
    });
    await newSession.save();

    res
      .status(201)
      .json({ message: "Session created successfully.", session: newSession });
  } catch (error) {
    res.status(500).json({ message: "Error creating session.", error });
  }
};

