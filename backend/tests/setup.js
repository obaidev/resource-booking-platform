import "dotenv/config";
import mongoose from "mongoose";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      "mongodb://localhost:27017/resource_booking_test?replicaSet=rs0&retryWrites=false",
    );
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
