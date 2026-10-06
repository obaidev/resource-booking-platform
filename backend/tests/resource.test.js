/// <reference types="jest" />

import request from "supertest";
import app from "../src/app.js";

describe("Resource API", () => {
  let ownerToken;
  let secondOwnerToken;
  let customerToken;
  let workspaceId;
  let secondWorkspaceId;
  let resourceId;

  const ownerEmail = `resourceowner${Date.now()}@example.com`;
  const secondOwnerEmail = `resourcesecondowner${Date.now()}@example.com`;
  const customerEmail = `resourcecustomer${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create owner
    await request(app).post("/api/auth/register").send({
      name: "Resource Owner",
      email: ownerEmail,
      password: "12345678",
      role: "owner",
    });

    const ownerLogin = await request(app).post("/api/auth/login").send({
      email: ownerEmail,
      password: "12345678",
    });

    ownerToken = ownerLogin.body.token;

    // Create second owner
    await request(app).post("/api/auth/register").send({
      name: "Second Resource Owner",
      email: secondOwnerEmail,
      password: "12345678",
      role: "owner",
    });

    const secondOwnerLogin = await request(app).post("/api/auth/login").send({
      email: secondOwnerEmail,
      password: "12345678",
    });

    secondOwnerToken = secondOwnerLogin.body.token;

    // Create customer
    await request(app).post("/api/auth/register").send({
      name: "Resource Customer",
      email: customerEmail,
      password: "12345678",
      role: "customer",
    });

    const customerLogin = await request(app).post("/api/auth/login").send({
      email: customerEmail,
      password: "12345678",
    });

    customerToken = customerLogin.body.token;

    // Create workspace for first owner
    const workspaceResponse = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Resource Test Workspace",
        address: "Blue Area, Islamabad",
        description: "Workspace for resource testing",
        operatingHours: {
          open: "09:00",
          close: "22:00",
        },
      });

    expect(workspaceResponse.statusCode).toBe(201);

    workspaceId = workspaceResponse.body.workspace._id;

    // Create workspace for second owner
    const secondWorkspaceResponse = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${secondOwnerToken}`)
      .send({
        name: "Second Owner Workspace",
        address: "F-7, Islamabad",
        description: "Second owner's workspace",
        operatingHours: {
          open: "09:00",
          close: "22:00",
        },
      });

    expect(secondWorkspaceResponse.statusCode).toBe(201);

    secondWorkspaceId = secondWorkspaceResponse.body.workspace._id;
  });

  describe("POST /api/resources", () => {
    it("should create a resource for an owner", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Desk",
          type: "desk",
          capacity: 1,
          hourlyPrice: 500,
          dailyPrice: 3000,
          workspace: workspaceId,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("Resource created successfully");
      expect(response.body.resource).toBeDefined();
      expect(response.body.resource.name).toBe("Test Desk");
      expect(response.body.resource.type).toBe("desk");
      expect(response.body.resource.capacity).toBe(1);
      expect(response.body.resource.hourlyPrice).toBe(500);
      expect(response.body.resource.workspace).toBe(workspaceId);

      resourceId = response.body.resource._id;
    });

    it("should reject resource creation when name is missing", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          type: "desk",
          capacity: 1,
          hourlyPrice: 500,
          workspace: workspaceId,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("name is required");
    });

    it("should reject resource creation when type is missing", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Missing Type Desk",
          capacity: 1,
          hourlyPrice: 500,
          workspace: workspaceId,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("type is required");
    });

    it("should reject resource creation when capacity is missing", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Missing Capacity Desk",
          type: "desk",
          hourlyPrice: 500,
          workspace: workspaceId,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("capacity is required");
    });

    it("should reject resource creation when hourlyPrice is missing", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Missing Price Desk",
          type: "desk",
          capacity: 1,
          workspace: workspaceId,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("hourlyPrice is required");
    });

    it("should reject resource creation when workspace is missing", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Missing Workspace Desk",
          type: "desk",
          capacity: 1,
          hourlyPrice: 500,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("workspaceId is required");
    });

    it("should reject resource creation with an invalid type", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Invalid Type Resource",
          type: "invalid_type",
          capacity: 1,
          hourlyPrice: 500,
          workspace: workspaceId,
        });

      expect(response.statusCode).toBe(500);
    });

    it("should reject resource creation for a workspace owned by another owner", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Unauthorized Workspace Resource",
          type: "desk",
          capacity: 1,
          hourlyPrice: 500,
          workspace: secondWorkspaceId,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Workspace not found");
    });

    it("should reject resource creation for a customer", async () => {
      const response = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Customer Resource",
          type: "desk",
          capacity: 1,
          hourlyPrice: 500,
          workspace: workspaceId,
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe("Access denied");
    });

    it("should reject resource creation without authentication", async () => {
      const response = await request(app).post("/api/resources").send({
        name: "Unauthenticated Resource",
        type: "desk",
        capacity: 1,
        hourlyPrice: 500,
        workspace: workspaceId,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/resources", () => {
    it("should return active resources", async () => {
      const response = await request(app)
        .get("/api/resources")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Resources fetched successfully");
      expect(Array.isArray(response.body.resources)).toBe(true);
      expect(response.body.resources.length).toBeGreaterThan(0);
    });

    it("should allow a customer to fetch resources", async () => {
      const response = await request(app)
        .get("/api/resources")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.resources)).toBe(true);
    });

    it("should reject fetching resources without authentication", async () => {
      const response = await request(app).get("/api/resources");

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/resources/:id", () => {
    it("should return a resource by ID", async () => {
      const response = await request(app)
        .get(`/api/resources/${resourceId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Resource Fetched successfully");
      expect(response.body.resource).toBeDefined();
      expect(response.body.resource._id).toBe(resourceId);
      expect(response.body.resource.name).toBe("Test Desk");
    });

    it("should return 404 for a resource that does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .get(`/api/resources/${fakeId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Resource not found");
    });

    it("should reject fetching a resource without authentication", async () => {
      const response = await request(app).get(`/api/resources/${resourceId}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /api/resources/:id", () => {
    it("should update a resource", async () => {
      const response = await request(app)
        .patch(`/api/resources/${resourceId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Updated Test Desk",
          capacity: 2,
          hourlyPrice: 600,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Resource updated successfully");
      expect(response.body.resource).toBeDefined();
      expect(response.body.resource.name).toBe("Updated Test Desk");
      expect(response.body.resource.capacity).toBe(2);
      expect(response.body.resource.hourlyPrice).toBe(600);
    });

    it("should reject update when no fields are provided", async () => {
      const response = await request(app)
        .patch(`/api/resources/${resourceId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("At least one field is required");
    });

    it("should return 404 when updating a resource that does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .patch(`/api/resources/${fakeId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Updated Resource",
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Resource not found");
    });

    it("should reject resource update for a customer", async () => {
      const response = await request(app)
        .patch(`/api/resources/${resourceId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Customer Update",
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe("Access denied");
    });

    it("should reject resource update by another owner", async () => {
      const response = await request(app)
        .patch(`/api/resources/${resourceId}`)
        .set("Authorization", `Bearer ${secondOwnerToken}`)
        .send({
          name: "Unauthorized Update",
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        "You are not authorized to update this resource",
      );
    });

    it("should reject resource update without authentication", async () => {
      const response = await request(app)
        .patch(`/api/resources/${resourceId}`)
        .send({
          name: "Unauthenticated Update",
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /api/resources/:id", () => {
    it("should deactivate a resource", async () => {
      const response = await request(app)
        .delete(`/api/resources/${resourceId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Resource deactivated successfully");
      expect(response.body.resource).toBeDefined();
      expect(response.body.resource.status).toBe("inactive");
    });

    it("should return 404 when deleting a resource that does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/api/resources/${fakeId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Resource not found");
    });

    it("should reject resource deletion for a customer", async () => {
      const response = await request(app)
        .delete(`/api/resources/${resourceId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe("Access denied");
    });

    it("should reject resource deletion by another owner", async () => {
      const response = await request(app)
        .delete(`/api/resources/${resourceId}`)
        .set("Authorization", `Bearer ${secondOwnerToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        "You are not authorized to delete this resource",
      );
    });

    it("should reject resource deletion without authentication", async () => {
      const response = await request(app).delete(
        `/api/resources/${resourceId}`,
      );

      expect(response.statusCode).toBe(401);
    });
  });
});
