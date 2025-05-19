import Vendor from "../models/Vendor.js";

export const getRestaurants = async (req, res) => {
  try {
    const { query } = req.query;

    const regex = new RegExp(query, "i");

    // If there's no query, just return all vendors (as you already do)
    if (!query) {
      const vendors = await Vendor.find({}).select(
        "-password -otp -otpExpires -__v"
      );
      if (!vendors.length) {
        return res.status(404).json({ message: "No restaurants found." });
      }
      return res.status(200).json({ message: "All Restaurants", data: vendors });
    }

    const vendors = await Vendor.aggregate([
      {
        $lookup: {
          from: "menus", // MongoDB collection name for your menu model
          localField: "_id",
          foreignField: "vendor",
          as: "menus",
        },
      },
      {
        $match: {
          $or: [
            { businessName: regex },
            { "menus.dishName": regex },
            { "menus.category": regex },
            { "menus.cuisineType": regex },
          ],
        },
      },
      {
        $project: {
          businessName: 1,
          businessType: 1,
          email: 1,
          phone: 1,
          address: 1,
          branch: 1,
          profileImage: 1,
          services: 1,
          createdAt: 1,
          menus: {
            $filter: {
              input: "$menus",
              as: "menu",
              cond: {
                $or: [
                  { $regexMatch: { input: "$$menu.dishName", regex: regex } },
                  { $regexMatch: { input: "$$menu.category", regex: regex } },
                  { $regexMatch: { input: "$$menu.cuisineType", regex: regex } },
                ],
              },
            },
          },
        },
      },
    ]);

    if (!vendors.length) {
      return res.status(404).json({ message: "No matching restaurants found." });
    }

    res.status(200).json({ message: "Search Results", data: vendors });
  } catch (error) {
    console.error("Error Fetching Restaurants:", error);
    res.status(500).json({
      message: "Error Fetching Restaurants",
      error: error.message || "Unknown server error",
    });
  }
};
