import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["desk", "meeting_room", "private_office"],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    hourlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    dailyPrice: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
