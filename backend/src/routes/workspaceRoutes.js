import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceByID,
  getWorkspaces,
  updateWorkspace,
} from "../controller/workspaceController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const workspaceRoute = express.Router();

workspaceRoute.post("/", protect, authorize("owner"), createWorkspace);

workspaceRoute.get("/", protect, authorize("owner"), getWorkspaces);

workspaceRoute.get("/:id", protect, authorize("owner"), getWorkspaceByID);

workspaceRoute.patch("/:id", protect, authorize("owner"), updateWorkspace);

workspaceRoute.delete(
  "/:id",
  protect,
  authorize("owner", "admin"),
  deleteWorkspace,
);

export default workspaceRoute;
