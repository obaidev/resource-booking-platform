/// <reference types="jest" />

import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import User from "../src/models/user.js";

describe("Admin API", () => {
  let adminToken;
  let customerToken;
  let ownerToken;

  const adminEmail = `admintest${Date.now()}@example.com`;
  const customerEmail = `admincustomer${Date.now()}@example.com`;
  const ownerEmail = `adminowner${Date.now()}@example.com`;

  beforeAll(async () => {
    // =========================================
    // CREATE ADMIN USER
    // =========================================

    const hashedPassword = await bcrypt.hash("12345678", 10);

    await User.create({
      name: "Admin Test User",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    // =========================================
    // ADMIN LOGIN
    // =========================================

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: adminEmail,
      password: "12345678",
    });

    expect(adminLogin.statusCode).toBe(200);
    expect(adminLogin.body.token).toBeDefined();

    adminToken = adminLogin.body.token;

    // =========================================
    // CREATE CUSTOMER
    // =========================================

    const customerRegister = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Admin Test Customer",
        email: customerEmail,
        password: "12345678",
        role: "customer",
      });

    expect(customerRegister.statusCode).toBe(201);

    const customerLogin = await request(app).post("/api/auth/login").send({
      email: customerEmail,
      password: "12345678",
    });

    expect(customerLogin.statusCode).toBe(200);
    expect(customerLogin.body.token).toBeDefined();

    customerToken = customerLogin.body.token;

    // =========================================
    // CREATE OWNER
    // =========================================

    const ownerRegister = await request(app).post("/api/auth/register").send({
      name: "Admin Test Owner",
      email: ownerEmail,
      password: "12345678",
      role: "owner",
    });

    expect(ownerRegister.statusCode).toBe(201);

    const ownerLogin = await request(app).post("/api/auth/login").send({
      email: ownerEmail,
      password: "12345678",
    });

    expect(ownerLogin.statusCode).toBe(200);
    expect(ownerLogin.body.token).toBeDefined();

    ownerToken = ownerLogin.body.token;
  });

  // =========================================
  // GET ADMIN DASHBOARD
  // =========================================

  describe("GET /api/admin/dashboard", () => {
    it("should allow admin to access dashboard", async () => {
      const response = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);

      expect(response.body.message).toBe(
        "Admin dashboard fetched successfully",
      );

      expect(response.body.stats).toBeDefined();
    });

    it("should return dashboard statistics", async () => {
      const response = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);

      const { stats } = response.body;

      expect(stats).toBeDefined();

      expect(typeof stats.totalUsers).toBe("number");
      expect(typeof stats.totalWorkspaces).toBe("number");
      expect(typeof stats.totalResources).toBe("number");
      expect(typeof stats.totalBookings).toBe("number");
    });

    it("should return valid non-negative statistics", async () => {
      const response = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);

      const { stats } = response.body;

      expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
      expect(stats.totalWorkspaces).toBeGreaterThanOrEqual(0);
      expect(stats.totalResources).toBeGreaterThanOrEqual(0);
      expect(stats.totalBookings).toBeGreaterThanOrEqual(0);
    });

    it("should reject customer access", async () => {
      const response = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(403);
    });

    it("should reject owner access", async () => {
      const response = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(403);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await request(app).get("/api/admin/dashboard");

      expect(response.statusCode).toBe(401);
    });

    it("should reject invalid token", async () => {
      const response = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", "Bearer invalid-token");

      expect(response.statusCode).toBe(401);
    });
  });
});
