import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../controller/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import express from "express";

const authRoute = express.Router();

authRoute.post("/register", registerUser);

authRoute.post("/login", loginUser);

authRoute.get("/current-user", protect, getCurrentUser);
export default authRoute;
