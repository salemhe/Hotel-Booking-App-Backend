import Vendor from "../models/Vendor.js";

export const getRestaurants = async (req, res) => {
  try {
    const { query } = req.query; // Extract parameters from the query

    if (!query) {
      const vendors = await Vendor.find({}).select(
        "-password -otp -otpExpires -__v"
      );
      if (vendors.length === 0) {
        return res.status(404).json({ message: "No restaurants found." });
      }
      return res.status(200).json({message: "Search Results", data: vendors});
    }

    const regex = new RegExp(query, "i");

    const vendors = await Vendor.aggregate([
      {
        $lookup: {
          from: "menus", // <-- Must match the MongoDB collection name (plural of model)
          localField: "_id",
          foreignField: "vendor",
          as: "menus",
        },
      },
      {
        $addFields: {
          matchingMenus: {
            $filter: {
              input: "$menus",
              as: "menu",
              cond: {
                $or: [
                  { $regexMatch: { input: "$$menu.dishName", regex } },
                  { $regexMatch: { input: "$$menu.category", regex } },
                  { $regexMatch: { input: "$$menu.cuisineType", regex } },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { businessName: regex },
            { "matchingMenus.0": { $exists: true } },
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
          createdAt: 1
        },
      },
    ]);

    if (vendors.length === 0) {
      return res
        .status(404)
        .json({ message: "No matching restaurants found." });
    }

    res.status(200).json({message: "Search Results", data: vendors});
} catch (error) {
    console.error("Error Fetching Restaurants:", error);

    res.status(500).json({
      message: "Error Fetching Restaurants",
      error: error.message || "Unknown server error",
    });
  }
};
