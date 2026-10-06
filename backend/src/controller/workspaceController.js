import Workspace from "../models/workspace.js";

export const createWorkspace = async (req, res, next) => {
  try {
    const { name, address, description, operatingHours } = req.body;
    const requiredFields = { name, address, operatingHours };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }
    const workspace = new Workspace({
      name,
      address,
      description,
      operatingHours,
      owner: req.user._id,
    });
    await workspace.save();
    await workspace.populate("owner", "name");
    return res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      owner: req.user._id,
      status: "active",
    }).populate("owner", "name");
    return res.status(200).json({
      message: "Workspaces fetched successfully",
      workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findOne({
      _id: id,
      owner: req.user._id,
      status: "active",
    }).populate("owner", "name");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }
    return res.status(200).json({
      message: "Workspaces Fetched successfully",
      workspace: workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findOneAndUpdate(
      {
        _id: id,
        owner: req.user._id,
      },
      {
        status: "inactive",
      },
      {
        returnDocument: "after",
      },
    );

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }
    return res.status(200).json({
      message: "Workspace Delete successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { name, address, description, operatingHours } = req.body;
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "At least one field is required",
      });
    }

    const workspace = await Workspace.findOneAndUpdate(
      {
        _id: id,
        owner: req.user._id,
        status: "active",
      },
      {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(description !== undefined && { description }),
        ...(operatingHours !== undefined && { operatingHours }),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("owner", "name");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    return res.status(200).json({
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (error) {
    next(error);
  }
};
