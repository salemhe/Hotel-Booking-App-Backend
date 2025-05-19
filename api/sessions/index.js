
import Session from "../models/Session.js"



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


