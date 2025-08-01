// Stub controller for hotel vendor endpoints

export const getHotelDashboardOverview = (req, res) => res.json({ message: "Hotel dashboard overview" });
export const getHotelBookingsRecent = (req, res) => res.json({ message: "Recent hotel bookings" });
export const getHotelPaymentsRecent = (req, res) => res.json({ message: "Recent hotel payments" });
export const getHotelBranches = (req, res) => res.json({ message: "Hotel branches" });
export const getHotelStaffList = (req, res) => res.json({ message: "Hotel staff list" });

export const getHotelAccounts = (req, res) => res.json({ message: "Hotel accounts" });
export const verifyHotelAccount = (req, res) => res.json({ message: "Verify hotel account" });
export const createHotelAccount = (req, res) => res.json({ message: "Create hotel account" });
export const updateHotelAccount = (req, res) => res.json({ message: "Update hotel account" });
export const getHotelPaymentsStats = (req, res) => res.json({ message: "Hotel payments stats" });
export const getHotelPaymentsTransactions = (req, res) => res.json({ message: "Hotel payments transactions" });

export const createHotelStaff = (req, res) => res.json({ message: "Create hotel staff" });
export const updateHotelStaff = (req, res) => res.json({ message: "Update hotel staff" });
export const deleteHotelStaff = (req, res) => res.json({ message: "Delete hotel staff" });

export const getHotelProfile = (req, res) => res.json({ message: "Hotel profile" });
export const updateHotelProfile = (req, res) => res.json({ message: "Update hotel profile" });
export const updateHotelProfilePassword = (req, res) => res.json({ message: "Update hotel profile password" });

export const getHotelRooms = (req, res) => res.json({ message: "Hotel rooms" });
export const createHotelRoom = (req, res) => res.json({ message: "Create hotel room" });
export const updateHotelRoom = (req, res) => res.json({ message: "Update hotel room" });
export const deleteHotelRoom = (req, res) => res.json({ message: "Delete hotel room" });
