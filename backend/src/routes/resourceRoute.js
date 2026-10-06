import express from "express";

import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controller/resourceController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const resourceRoute = express.Router();

resourceRoute.post("/", protect, authorize("owner"), createResource);
resourceRoute.get("/", protect, getResources);
resourceRoute.get("/:id", protect, getResourceById);
resourceRoute.patch("/:id", protect, authorize("owner"), updateResource);
resourceRoute.delete("/:id", protect, authorize("owner"), deleteResource);

export default resourceRoute;
