import Vendor from "../models/Vendor.js";

import Hotel from "../models/Hotel.js";

export const getRestaurants = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const regex = query ? new RegExp(query, "i") : null;


    // If there's no query, just return all vendors (as you already do)
    if (!query) {
      const vendors = await Vendor.find({ businessType: "restaurant" })
              .select("-password -otp -otpExpires -__v")
              .skip(skip)
              .limit(Number(limit));

      const total = await Vendor.countDocuments({ businessType: "restaurant" });

      if (!vendors.length) {
        return res.status(404).json({ message: "No restaurants found." });
      }
      return res.status(200).json({ message: "All Restaurants", data: vendors, pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },});
    }

    const vendors = await Vendor.aggregate([
      {
        $lookup: {
          from: "menus", // MongoDB collection name
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




// export const getHotels = async (req, res) => {
//   try {
//     const { query, page = 1, limit = 10 } = req.query;

//     const pageNum = Math.max(1, Number(page));
//     const limitNum = Math.max(1, Number(limit));
//     const skip = (pageNum - 1) * limitNum;

//     const regex = query ? new RegExp(query, "i") : null;

//     // 🔹 If no query, return all hotels with pagination
//     if (!query) {


//       const vendors = await Vendor.find({ businessType: "hotel" })
//         .select("-password -otp -otpExpires -__v")
//         .skip(skip)
//         .limit(Number(limit));

//       const total = await Vendor.countDocuments({ businessType: "hotel" });

//             if (!vendors.length) {
//         return res.status(404).json({ message: "No hotels found." });
//       }
//       return res.status(200).json({ message: "All Hotels", data: vendors, pagination: {
//           total,
//           page: Number(page),
//           limit: Number(limit),
//           pages: Math.ceil(total / limit),
//         },});

//     }


//     // 🔹 Search by roomType, stars, or city using aggregation
//     const matchQuery = {
//       $or: [
//         { "rooms.roomType": regex },
//         { stars: { $regexMatch: { input: { $toString: "$stars" }, regex } } },
//         { "location.city": regex },
//       ],
//     };

//     const pipeline = [
//       { $match: matchQuery },
//       {
//         $project: {
//           vendorId: 1,
//           businessDescription: 1,
//           location: 1,
//           website: 1,
//           openTime: 1,
//           closeTime: 1,
//           profileImages: 1,
//           stars: 1,
//           createdAt: 1,
//           rooms: {
//             $filter: {
//               input: "$rooms",
//               as: "room",
//               cond: {
//                 $regexMatch: {
//                   input: "$$room.roomType",
//                   regex: regex,
//                 },
//               },
//             },
//           },
//         },
//       },
//       { $skip: skip },
//       { $limit: limitNum },
//     ];

//     const countPipeline = [
//       { $match: matchQuery },
//       { $count: "total" },
//     ];

//     const [hotels, countResult] = await Promise.all([
//       Hotel.aggregate(pipeline),
//       Hotel.aggregate(countPipeline),
//     ]);

//     const total = countResult[0]?.total || 0;

//     if (!hotels.length) {
//       return res.status(404).json({ message: "No matching hotels found." });
//     }

//     return res.status(200).json({
//       message: "Search Results",
//       data: hotels,
//       pagination: {
//         total,
//         page: pageNum,
//         limit: limitNum,
//         pages: Math.ceil(total / limitNum),
//       },
//     });
//   } catch (error) {
//     console.error("Error Fetching Hotels:", error);
//     res.status(500).json({
//       message: "Error Fetching Hotels",
//       error: error.message || "Unknown server error",
//     });
//   }
// };


export const getHotels = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

   const queryStr = query?.toString() || null;


    if (!queryStr) {
      const vendors = await Vendor.find({ businessType: "hotel" })
        .select("-password -otp -otpExpires -__v")
        .skip(skip)
        .limit(limitNum);

      const total = await Vendor.countDocuments({ businessType: "hotel" });

      if (!vendors.length) {
        return res.status(404).json({ message: "No hotels found." });
      }

      return res.status(200).json({
        message: "All Hotels",
        data: vendors,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    }

    // Search logic
    const matchQuery = {  
          $or: [
            { "rooms.roomType": { $regex: queryStr, $options: "i" } },
            { "location.city": { $regex: queryStr, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$stars" },
                  regex: queryStr,
                  options: "i"
                },
              },
            },
            { stars: Number(queryStr) || -1 }
          ],
       };

    const pipeline = [
      { $match: matchQuery },
      {
        $project: {
          vendorId: 1,
          businessDescription: 1,
          location: 1,
          website: 1,
          openTime: 1,
          closeTime: 1,
          profileImages: 1,
          stars: 1,
          createdAt: 1,
          rooms: 1,
        },
      },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const countPipeline = [{ $match: matchQuery }, { $count: "total" }];

    const [hotels, countResult] = await Promise.all([
      Hotel.aggregate(pipeline),
      Hotel.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    console.log("QueryStr:", queryStr);
console.log("Found hotels:", hotels.length);

    if (!hotels.length) {
      return res.status(404).json({ message: "No matching hotels found." });
    }

    return res.status(200).json({
      message: "Search Results",
      data: hotels,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error Fetching Hotels:", error);
    res.status(500).json({
      message: "Error Fetching Hotels",
      error: error.message || "Unknown server error",
    });
  }
};








