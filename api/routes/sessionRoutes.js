import express from "express";
import { createSession } from "../sessions/create.js";
import { getSession } from "../sessions/index.js";
import { deleteSession } from "../sessions/delete.js";

const router = express.Router();

router.post("/", createSession);

router.get("/:id", getSession);

router.delete("/delete/:id", deleteSession);

export default router;

