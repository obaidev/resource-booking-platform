import mongoose from "mongoose";
import Resource from "../models/resource.js";
import Booking from "../models/booking.js";
import Workspace from "../models/workspace.js";

export const createBooking = async (req, res, next) => {
  try {
    const { resource, startTime, endTime } = req.body;
    const requiredFields = { resource, startTime, endTime };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Basic date validation
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid startTime or endTime",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "Invalid time range",
      });
    }

    // Booking cannot start in the past
    if (start < new Date()) {
      return res.status(400).json({
        message: "Booking cannot be made in the past",
      });
    }

    const session = await mongoose.startSession();

    try {
      let createdBooking;

      await session.withTransaction(async () => {
        const resourceData = await Resource.findOneAndUpdate(
          {
            _id: resource,
            status: "active",
          },
          {
            $set: {
              updatedAt: new Date(),
            },
          },
          {
            returnDocument: "after",
            session,
          },
        );

        if (!resourceData) {
          const error = new Error("Resource not found");
          error.statusCode = 404;
          throw error;
        }

        const conflictingBooking = await Booking.findOne({
          resource,
          status: "confirmed",
          startTime: { $lt: end },
          endTime: { $gt: start },
        }).session(session);

        if (conflictingBooking) {
          const error = new Error("Resource is already booked for this time");
          error.statusCode = 409;
          throw error;
        }

        const durationInHours = (end - start) / (1000 * 60 * 60);

        const totalPrice = durationInHours * resourceData.hourlyPrice;

        const booking = new Booking({
          user: req.user._id,
          resource: resourceData._id,
          startTime: start,
          endTime: end,
          totalPrice,
          status: "confirmed",
        });

        await booking.save({ session });

        createdBooking = booking;
      });

      return res.status(201).json({
        message: "Booking created successfully",
        booking: createdBooking,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    }).populate("resource");

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find booking belonging to the logged-in customer
    const booking = await Booking.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    // Cannot cancel within 1 hour of start time
    const now = new Date();
    const oneHourBeforeStart = new Date(
      booking.startTime.getTime() - 60 * 60 * 1000,
    );

    if (now >= oneHourBeforeStart) {
      return res.status(400).json({
        message: "You cannot cancel this booking within 1 hour of start time",
      });
    }

    // Update existing booking
    booking.status = "cancelled";

    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceBookings = async (req, res, next) => {
  try {
    const workspaceDocs = await Workspace.find({
      owner: req.user._id,
    }).select("_id");

    if (workspaceDocs.length === 0)
      return res.status(404).json({
        message: "No Workspace found",
      });
    const workspaceIds = workspaceDocs.map((workspace) => workspace._id);

    const resourceDocs = await Resource.find({
      workspace: { $in: workspaceIds },
    });
    if (resourceDocs.length === 0)
      return res.status(404).json({
        message: "No Resource found",
      });
    const resourceIds = resourceDocs.map((resource) => resource._id);
    const bookings = await Booking.find({
      resource: { $in: resourceIds },
      status: "confirmed",
    })
      .populate("user", "name email")
      .populate("resource", "name type workspace")
      .sort({ startTime: 1 });
    if (bookings.length === 0) {
      return res.status(404).json({
        message: "No bookings found",
      });
    }
    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate({
        path: "resource",
        select: "name type workspace",
        populate: {
          path: "workspace",
          select: "name address",
        },
      })
      .sort({ startTime: 1 });

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "No Booking found",
      });
    }

    return res.status(200).json({
      message: "Booking fetched",
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getResourceAvailability = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    // Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    // Sorting
    const allowedSortFields = ["createdAt", "name", "hourlyPrice"];

    const sortBy = allowedSortFields.includes(req.query.sort)
      ? req.query.sort
      : "createdAt";

    const order = req.query.order === "desc" ? -1 : 1;

    // Price filters
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);

    // Convert requested time into Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate time
    if (
      !startTime ||
      !endTime ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      start >= end
    ) {
      return res.status(400).json({
        message: "Invalid time range",
      });
    }

    // Find confirmed bookings that overlap requested time
    const bookedBookings = await Booking.find({
      status: "confirmed",
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).select("resource");

    // Get IDs of booked resources
    const bookedResourceIds = bookedBookings.map((booking) => booking.resource);

    // Build resource filter
    const resourceFilter = {
      _id: { $nin: bookedResourceIds },
      status: "active",
    };

    // Add minimum price filter
    if (!isNaN(minPrice)) {
      resourceFilter.hourlyPrice = {
        ...resourceFilter.hourlyPrice,
        $gte: minPrice,
      };
    }

    // Add maximum price filter
    if (!isNaN(maxPrice)) {
      resourceFilter.hourlyPrice = {
        ...resourceFilter.hourlyPrice,
        $lte: maxPrice,
      };
    }

    // Count matching resources
    const total = await Resource.countDocuments(resourceFilter);

    // Get available resources
    const resources = await Resource.find(resourceFilter)
      .sort({
        [sortBy]: order,
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "Available resources fetched",
      resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
