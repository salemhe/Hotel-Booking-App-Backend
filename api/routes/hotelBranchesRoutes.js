import express from "express";
import * as hotelBranchesController from "../controllers/hotelBranchesController.js";
const router = express.Router();

router.get("/", hotelBranchesController.getAllHotelBranches);
router.get("/:id", hotelBranchesController.getHotelBranchById);
router.post("/", hotelBranchesController.createHotelBranch);
router.put("/:id", hotelBranchesController.updateHotelBranch);
router.delete("/:id", hotelBranchesController.deleteHotelBranch);

export default router;
