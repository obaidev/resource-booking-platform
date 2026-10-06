import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getMyBookings,
  getWorkspaceBookings,
  getResourceAvailability,
} from "../controller/bookingController.js";

import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const bookingRoute = express.Router();

bookingRoute.post("/", protect, authorize("customer"), createBooking);

bookingRoute.get("/my-bookings", protect, authorize("customer"), getMyBookings);

bookingRoute.post("/:id/cancel", protect, authorize("customer"), cancelBooking);

bookingRoute.get(
  "/workspace",
  protect,
  authorize("owner"),
  getWorkspaceBookings,
);

bookingRoute.get("/availability", protect, getResourceAvailability);

bookingRoute.get("/", protect, authorize("admin"), getAllBookings);

export default bookingRoute;
