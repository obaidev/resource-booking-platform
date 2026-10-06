/// <reference types="jest" />

import request from "supertest";
import app from "../src/app.js";

describe("Workspace API", () => {
  let ownerToken;
  let customerToken;
  let workspaceId;

  const ownerEmail = `workspaceowner${Date.now()}@example.com`;
  const customerEmail = `workspacecustomer${Date.now()}@example.com`;

  beforeAll(async () => {
    // Create owner
    await request(app).post("/api/auth/register").send({
      name: "Workspace Owner",
      email: ownerEmail,
      password: "12345678",
      role: "owner",
    });

    const ownerLogin = await request(app).post("/api/auth/login").send({
      email: ownerEmail,
      password: "12345678",
    });

    ownerToken = ownerLogin.body.token;

    // Create customer
    await request(app).post("/api/auth/register").send({
      name: "Workspace Customer",
      email: customerEmail,
      password: "12345678",
      role: "customer",
    });

    const customerLogin = await request(app).post("/api/auth/login").send({
      email: customerEmail,
      password: "12345678",
    });

    customerToken = customerLogin.body.token;

    // Admin cannot be registered through the public registration endpoint,
    // so for this test suite we don't create an admin token here.
  });

  describe("POST /api/workspaces", () => {
    it("should create a workspace for an owner", async () => {
      const response = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Workspace",
          address: "Blue Area, Islamabad",
          description: "Test coworking workspace",
          operatingHours: {
            open: "09:00",
            close: "22:00",
          },
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("Workspace created successfully");
      expect(response.body.workspace).toBeDefined();
      expect(response.body.workspace.name).toBe("Test Workspace");
      expect(response.body.workspace.address).toBe("Blue Area, Islamabad");
      expect(response.body.workspace.owner).toBeDefined();

      workspaceId = response.body.workspace._id;
    });

    it("should reject workspace creation when name is missing", async () => {
      const response = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          address: "Blue Area, Islamabad",
          operatingHours: {
            open: "09:00",
            close: "22:00",
          },
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("name is required");
    });

    it("should reject workspace creation when address is missing", async () => {
      const response = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Workspace",
          operatingHours: {
            open: "09:00",
            close: "22:00",
          },
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("address is required");
    });

    it("should reject workspace creation when operatingHours is missing", async () => {
      const response = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Workspace",
          address: "Blue Area, Islamabad",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("operatingHours is required");
    });

    it("should reject workspace creation for a customer", async () => {
      const response = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Customer Workspace",
          address: "Islamabad",
          operatingHours: {
            open: "09:00",
            close: "18:00",
          },
        });

      expect(response.statusCode).toBe(403);
    });

    it("should reject workspace creation without authentication", async () => {
      const response = await request(app)
        .post("/api/workspaces")
        .send({
          name: "Unauthenticated Workspace",
          address: "Islamabad",
          operatingHours: {
            open: "09:00",
            close: "18:00",
          },
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/workspaces", () => {
    it("should return the owner's active workspaces", async () => {
      const response = await request(app)
        .get("/api/workspaces")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Workspaces fetched successfully");
      expect(Array.isArray(response.body.workspaces)).toBe(true);
      expect(response.body.workspaces.length).toBeGreaterThan(0);
      expect(response.body.workspaces[0].owner).toBeDefined();
    });

    it("should reject fetching workspaces for a customer", async () => {
      const response = await request(app)
        .get("/api/workspaces")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(403);
    });

    it("should reject fetching workspaces without authentication", async () => {
      const response = await request(app).get("/api/workspaces");

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/workspaces/:id", () => {
    it("should return a workspace by ID", async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Workspaces Fetched successfully");
      expect(response.body.workspace).toBeDefined();
      expect(response.body.workspace._id).toBe(workspaceId);
    });

    it("should return 404 for a workspace that does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .get(`/api/workspaces/${fakeId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Workspace not found");
    });

    it("should reject fetching a workspace for a customer", async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(403);
    });
  });

  describe("PATCH /api/workspaces/:id", () => {
    it("should update a workspace", async () => {
      const response = await request(app)
        .patch(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Updated Test Workspace",
          description: "Updated description",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Workspace updated successfully");
      expect(response.body.workspace).toBeDefined();
      expect(response.body.workspace.name).toBe("Updated Test Workspace");
      expect(response.body.workspace.description).toBe("Updated description");
    });

    it("should reject update when no fields are provided", async () => {
      const response = await request(app)
        .patch(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("At least one field is required");
    });

    it("should return 404 when updating a workspace that does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .patch(`/api/workspaces/${fakeId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Updated Workspace",
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Workspace not found");
    });

    it("should reject workspace update for a customer", async () => {
      const response = await request(app)
        .patch(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Customer Update",
        });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/workspaces/:id", () => {
    it("should delete a workspace by setting it inactive", async () => {
      const response = await request(app)
        .delete(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Workspace Delete successfully");
    });

    it("should return 404 when deleting a workspace that does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/api/workspaces/${fakeId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Workspace not found");
    });

    it("should reject workspace deletion for a customer", async () => {
      const response = await request(app)
        .delete(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(403);
    });
  });
});
