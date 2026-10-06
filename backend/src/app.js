import express from "express";
import authRoute from "./routes/authRoutes.js";
import workspaceRoute from "./routes/workspaceRoutes.js";
import resourceRoute from "./routes/resourceRoute.js";
import bookingRoute from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is Running",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/workspaces", workspaceRoute);
app.use("/api/resources", resourceRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);
export default app;
