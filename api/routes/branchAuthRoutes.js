import express from "express";
import {
  branchRegister,
  branchLogin,
  branchLogout,
  branchResetPassword
} from "../controllers/branchAuthController.js";
import { validateBody, branchRegisterSchema, branchLoginSchema, branchResetPasswordSchema } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Branch self-registration
router.post("/branch-register", validateBody(branchRegisterSchema), branchRegister);
// Branch login
router.post("/branch-login", validateBody(branchLoginSchema), branchLogin);
// Branch logout (stateless for JWT)
router.post("/branch-logout", branchLogout);
// Branch password reset
router.post("/branch-reset-password", validateBody(branchResetPasswordSchema), branchResetPassword);

export default router;
