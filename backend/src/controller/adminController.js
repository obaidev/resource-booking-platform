import User from "../models/user.js";
import Workspace from "../models/workspace.js";
import Resource from "../models/resource.js";
import Booking from "../models/booking.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalWorkspaces, totalResources, totalBookings] =
      await Promise.all([
        User.countDocuments(),
        Workspace.countDocuments(),
        Resource.countDocuments(),
        Booking.countDocuments(),
      ]);

    return res.status(200).json({
      message: "Admin dashboard fetched successfully",
      stats: {
        totalUsers,
        totalWorkspaces,
        totalResources,
        totalBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
