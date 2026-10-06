import Resource from "../models/resource.js";
import Workspace from "../models/workspace.js";

export const createResource = async (req, res, next) => {
  try {
    const {
      name,
      type,
      capacity,
      hourlyPrice,
      dailyPrice,
      workspace: workspaceId,
    } = req.body;

    const requiredFields = {
      name,
      type,
      capacity,
      hourlyPrice,
      workspaceId,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: req.user._id,
      status: "active",
    });
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    const resource = new Resource({
      name,
      type,
      capacity,
      hourlyPrice,
      dailyPrice,

      workspace: workspace._id,
    });
    await resource.save();

    return res.status(201).json({
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    next(error);
  }
};

export const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id).populate("workspace");

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    if (resource.workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to access this resource",
      });
    }

    return res.status(200).json({
      message: "Resource Fetched successfully",
      resource,
    });
  } catch (error) {
    next(error);
  }
};

export const getResources = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      status: "active",
    }).select("_id");

    const workspaceIds = workspaces.map((workspace) => workspace._id);

    const resources = await Resource.find({
      status: "active",
      workspace: { $in: workspaceIds },
    }).populate("workspace", "name address operatingHours");

    return res.status(200).json({
      message: "Resources fetched successfully",
      resources,
    });
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, hourlyPrice, dailyPrice } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "At least one field is required",
      });
    }

    const resource = await Resource.findById(id).populate("workspace");

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    if (resource.workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this resource",
      });
    }

    if (name !== undefined) {
      resource.name = name;
    }

    if (type !== undefined) {
      resource.type = type;
    }

    if (capacity !== undefined) {
      resource.capacity = capacity;
    }

    if (hourlyPrice !== undefined) {
      resource.hourlyPrice = hourlyPrice;
    }

    if (dailyPrice !== undefined) {
      resource.dailyPrice = dailyPrice;
    }

    await resource.save();

    return res.status(200).json({
      message: "Resource updated successfully",
      resource,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id).populate("workspace");

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    if (resource.workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this resource",
      });
    }

    resource.status = "inactive";

    await resource.save();

    return res.status(200).json({
      message: "Resource deactivated successfully",
      resource,
    });
  } catch (error) {
    next(error);
  }
};
