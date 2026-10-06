import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadYaml = (fileName) => {
  const filePath = path.join(__dirname, fileName);
  const fileContent = fs.readFileSync(filePath, "utf8");

  return YAML.parse(fileContent);
};

const swaggerSpec = {
  openapi: "3.0.0",

  info: {
    title: "Resource Booking API",
    version: "1.0.0",
    description: "API documentation for the Resource Booking Platform",
  },

  servers: [
    {
      url: "http://localhost:3000",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      ...loadYaml("schemas/auth.yaml"),
      ...loadYaml("schemas/workspace.yaml"),
      ...loadYaml("schemas/resource.yaml"),
      ...loadYaml("schemas/booking.yaml"),
    },
  },

  paths: {
    ...loadYaml("paths/auth.yaml"),
    ...loadYaml("paths/workspace.yaml"),
    ...loadYaml("paths/resource.yaml"),
    ...loadYaml("paths/booking.yaml"),
  },
};

export default swaggerSpec;
