// Stub controller for hotel branches endpoints

export const getAllHotelBranches = (req, res) => res.json({ message: "All hotel branches" });
export const getHotelBranchById = (req, res) => res.json({ message: `Hotel branch ${req.params.id}` });
export const createHotelBranch = (req, res) => res.json({ message: "Create hotel branch" });
export const updateHotelBranch = (req, res) => res.json({ message: `Update hotel branch ${req.params.id}` });
export const deleteHotelBranch = (req, res) => res.json({ message: `Delete hotel branch ${req.params.id}` });
