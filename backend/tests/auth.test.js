/// <reference types="jest" />

import request from "supertest";
import app from "../src/app.js";

describe("POST /api/auth/register", () => {
  it("should register a new customer", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Customer",
        email: `test${Date.now()}@example.com`,
        password: "12345678",
        role: "customer",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
  });

  it("should reject registration when email is missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test Customer",
      password: "12345678",
      role: "customer",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("email is required");
  });

  it("should reject registration when email already exists", async () => {
    const email = `duplicate${Date.now()}@example.com`;

    await request(app).post("/api/auth/register").send({
      name: "First User",
      email,
      password: "12345678",
      role: "customer",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email,
      password: "12345678",
      role: "customer",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("should reject registration with an invalid role", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: `invalidrole${Date.now()}@example.com`,
        password: "12345678",
        role: "admin",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid role");
  });

  it("should reject registration when password is missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: `missingpassword${Date.now()}@example.com`,
        role: "customer",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("password is required");
  });
});

describe("POST /api/auth/login", () => {
  it("should login a customer with valid credentials", async () => {
    const email = `login${Date.now()}@example.com`;
    const password = "12345678";

    await request(app).post("/api/auth/register").send({
      name: "Login Customer",
      email,
      password,
      role: "customer",
    });

    const response = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.role).toBe("customer");
  });

  it("should reject login with incorrect password", async () => {
    const email = `wrongpassword${Date.now()}@example.com`;
    const correctPassword = "12345678";

    await request(app).post("/api/auth/register").send({
      name: "Wrong Password User",
      email,
      password: correctPassword,
      role: "customer",
    });

    const response = await request(app).post("/api/auth/login").send({
      email,
      password: "wrongpassword",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid Credentials");
  });

  it("should reject login with an unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: `unknown${Date.now()}@example.com`,
        password: "12345678",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid Credentials");
  });

  it("should reject login when password is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: `test${Date.now()}@example.com`,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("password is required");
  });

  it("should reject login when email is missing", async () => {
    const response = await request(app).post("/api/auth/login").send({
      password: "12345678",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("email is required");
  });
});

describe("GET /api/auth/current-user", () => {
  it("should return the current authenticated user", async () => {
    const email = `currentuser${Date.now()}@example.com`;
    const password = "12345678";

    await request(app).post("/api/auth/register").send({
      name: "Current User",
      email,
      password,
      role: "customer",
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/api/auth/current-user")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Current user retrieved successfully");
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.role).toBe("customer");
  });

  it("should reject current-user request when token is missing", async () => {
    const response = await request(app).get("/api/auth/current-user");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Not authorized, token missing");
  });

  it("should reject current-user request with an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/current-user")
      .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      "Not authorized, invalid or expired token",
    );
  });
});
