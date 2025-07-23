import express from "express";
import { getPublicBranches } from "../controllers/branchDataController.js";

const router = express.Router();

// Public branches listing
router.get("/public/branches", getPublicBranches);

export default router;
