import express from "express";

import { getAdminDashboard } from "../controller/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", protect, authorize("admin"), getAdminDashboard);

export default adminRouter;
