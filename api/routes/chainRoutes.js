import express from "express";
import {
  createChain,
  updateChain,
  deleteChain,
  getChain
} from "../controllers/chainController.js";
import {
  authenticateUser,
  authenticateSuperAdmin
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Chain routes
router.post("/", authenticateSuperAdmin, createChain);
router.get("/:chainId", authenticateUser, getChain);
router.put("/:chainId", authenticateSuperAdmin, updateChain);
router.delete("/:chainId", authenticateSuperAdmin, deleteChain);

export default router;