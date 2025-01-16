
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

export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session)
      return res.status(404).json({ message: "Session not found." });

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error fetching session.", error });
  }
};

export const deleteSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Session deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting session.", error });
  }
};
