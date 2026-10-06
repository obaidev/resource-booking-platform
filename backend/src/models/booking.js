import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Helps booking conflict/availability queries
bookingSchema.index({
  resource: 1,
  status: 1,
  startTime: 1,
  endTime: 1,
});
bookingSchema.index({
  user: 1,
  startTime: 1,
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
