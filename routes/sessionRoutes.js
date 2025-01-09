import express from "express";
import {
  createSession,
  getSession,
  deleteSession,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", createSession);

router.get("/:id", getSession);

router.delete("/:id", deleteSession);

export default router;

