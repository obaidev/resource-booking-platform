/// <reference types="jest" />

import request from "supertest";
import app from "../src/app.js";

describe("Booking API", () => {
  let customerToken;
  let secondCustomerToken;
  let ownerToken;

  let workspaceId;
  let secondWorkspaceId;
  let resourceId;
  let secondResourceId;
  let cancellationResourceId;

  let bookingId;
  let cancellableBookingId;

  const customerEmail = `bookingcustomer${Date.now()}@example.com`;
  const secondCustomerEmail = `bookingcustomer2${Date.now()}@example.com`;
  const ownerEmail = `bookingowner${Date.now()}@example.com`;

  const getFutureTime = (daysAhead, hour, minute = 0) => {
    const date = new Date();

    date.setUTCDate(date.getUTCDate() + daysAhead);
    date.setUTCHours(hour, minute, 0, 0);

    return date.toISOString();
  };

  beforeAll(async () => {
    // =========================
    // CUSTOMER
    // =========================

    await request(app).post("/api/auth/register").send({
      name: "Booking Customer",
      email: customerEmail,
      password: "12345678",
      role: "customer",
    });

    const customerLogin = await request(app).post("/api/auth/login").send({
      email: customerEmail,
      password: "12345678",
    });

    customerToken = customerLogin.body.token;

    // =========================
    // SECOND CUSTOMER
    // =========================

    await request(app).post("/api/auth/register").send({
      name: "Second Booking Customer",
      email: secondCustomerEmail,
      password: "12345678",
      role: "customer",
    });

    const secondCustomerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: secondCustomerEmail,
        password: "12345678",
      });

    secondCustomerToken = secondCustomerLogin.body.token;

    // =========================
    // OWNER
    // =========================

    await request(app).post("/api/auth/register").send({
      name: "Booking Owner",
      email: ownerEmail,
      password: "12345678",
      role: "owner",
    });

    const ownerLogin = await request(app).post("/api/auth/login").send({
      email: ownerEmail,
      password: "12345678",
    });

    ownerToken = ownerLogin.body.token;

    // =========================
    // ADMIN
    // =========================
    //
    // Your current register controller does not allow
    // admin registration, so adminToken is intentionally
    // not created here.
    //
    // Admin authorization tests should be handled separately
    // if your project has a way to create an admin user.
    //

    // =========================
    // WORKSPACE
    // =========================

    const workspaceResponse = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Booking Test Workspace",
        address: "Blue Area, Islamabad",
        description: "Workspace for booking tests",
        operatingHours: {
          open: "09:00",
          close: "22:00",
        },
      });

    expect(workspaceResponse.statusCode).toBe(201);

    workspaceId = workspaceResponse.body.workspace._id;

    // =========================
    // SECOND WORKSPACE
    // =========================

    const secondWorkspaceResponse = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Second Booking Workspace",
        address: "F-7, Islamabad",
        description: "Second workspace for booking tests",
        operatingHours: {
          open: "09:00",
          close: "22:00",
        },
      });

    expect(secondWorkspaceResponse.statusCode).toBe(201);

    secondWorkspaceId = secondWorkspaceResponse.body.workspace._id;

    // =========================
    // RESOURCE
    // =========================

    const resourceResponse = await request(app)
      .post("/api/resources")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Booking Test Desk",
        type: "desk",
        capacity: 1,
        hourlyPrice: 500,
        dailyPrice: 3000,
        workspace: workspaceId,
      });

    expect(resourceResponse.statusCode).toBe(201);

    resourceId = resourceResponse.body.resource._id;

    // =========================
    // SECOND RESOURCE
    // =========================

    const secondResourceResponse = await request(app)
      .post("/api/resources")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Second Booking Desk",
        type: "desk",
        capacity: 1,
        hourlyPrice: 1000,
        dailyPrice: 6000,
        workspace: secondWorkspaceId,
      });

    expect(secondResourceResponse.statusCode).toBe(201);

    secondResourceId = secondResourceResponse.body.resource._id;

    // =========================
    // CANCELLATION RESOURCE
    // =========================

    const cancellationResourceResponse = await request(app)
      .post("/api/resources")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Cancellation Test Desk",
        type: "desk",
        capacity: 1,
        hourlyPrice: 750,
        dailyPrice: 4500,
        workspace: workspaceId,
      });

    expect(cancellationResourceResponse.statusCode).toBe(201);

    cancellationResourceId = cancellationResourceResponse.body.resource._id;
  });

  // =========================================================
  // CREATE BOOKING
  // =========================================================

  describe("POST /api/booking", () => {
    it("should create a booking for a customer", async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          resource: resourceId,
          startTime: getFutureTime(7, 10),
          endTime: getFutureTime(7, 12),
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.booking).toBeDefined();

      bookingId = response.body.booking._id;
    });

    it("should prevent double booking for the same resource and time", async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${secondCustomerToken}`)
        .send({
          resource: resourceId,
          startTime: getFutureTime(7, 10),
          endTime: getFutureTime(7, 12),
        });

      expect(response.statusCode).toBe(409);
    });

    it("should prevent overlapping booking", async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${secondCustomerToken}`)
        .send({
          resource: resourceId,
          startTime: getFutureTime(7, 11),
          endTime: getFutureTime(7, 13),
        });

      expect(response.statusCode).toBe(409);
    });

    it("should allow a booking immediately after an existing booking", async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${secondCustomerToken}`)
        .send({
          resource: resourceId,
          startTime: getFutureTime(7, 12),
          endTime: getFutureTime(7, 14),
        });

      expect(response.statusCode).toBe(201);
    });

    it("should reject booking when end time is before start time", async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          resource: secondResourceId,
          startTime: "2026-10-02T14:00:00.000Z",
          endTime: "2026-10-02T12:00:00.000Z",
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject booking when start and end time are equal", async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          resource: secondResourceId,
          startTime: "2026-10-02T12:00:00.000Z",
          endTime: "2026-10-02T12:00:00.000Z",
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject booking for an inactive resource", async () => {
      const resourceResponse = await request(app)
        .patch(`/api/resources/${secondResourceId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Updated Resource",
        });

      expect(resourceResponse.statusCode).toBe(200);

      const deleteResponse = await request(app)
        .delete(`/api/resources/${secondResourceId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(deleteResponse.statusCode).toBe(200);

      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          resource: secondResourceId,
          startTime: getFutureTime(9, 10),
          endTime: getFutureTime(9, 12),
        });

      expect(response.statusCode).toBe(404);
    });

    it("should reject booking without authentication", async () => {
      const response = await request(app).post("/api/booking").send({
        resource: resourceId,
        startTime: "2026-10-04T10:00:00.000Z",
        endTime: "2026-10-04T12:00:00.000Z",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject booking by an owner", async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          resource: resourceId,
          startTime: "2026-10-04T10:00:00.000Z",
          endTime: "2026-10-04T12:00:00.000Z",
        });

      expect(response.statusCode).toBe(403);
    });

    it("should calculate the correct total price", async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          resource: resourceId,
          startTime: getFutureTime(11, 10),
          endTime: getFutureTime(11, 13),
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.booking.totalPrice).toBe(1500);
    });
  });

  // =========================================================
  // MY BOOKINGS
  // =========================================================

  describe("GET /api/booking/my-bookings", () => {
    it("should return customer's bookings", async () => {
      const response = await request(app)
        .get("/api/booking/my-bookings")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.bookings).toBeDefined();
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    it("should reject unauthenticated request", async () => {
      const response = await request(app).get("/api/booking/my-bookings");

      expect(response.statusCode).toBe(401);
    });

    it("should reject owner access", async () => {
      const response = await request(app)
        .get("/api/booking/my-bookings")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(403);
    });
  });

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  describe("POST /api/booking/:id/cancel", () => {
    beforeAll(async () => {
      const response = await request(app)
        .post("/api/booking")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          resource: cancellationResourceId,
          startTime: getFutureTime(12, 10),
          endTime: getFutureTime(12, 12),
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.booking).toBeDefined();

      cancellableBookingId = response.body.booking._id;
    });

    it("should cancel customer's booking", async () => {
      const response = await request(app)
        .post(`/api/booking/${cancellableBookingId}/cancel`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.booking.status).toBe("cancelled");
    });

    it("should reject cancellation of a nonexistent booking", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .post(`/api/booking/${fakeId}/cancel`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(404);
    });

    it("should reject cancellation by an owner", async () => {
      const response = await request(app)
        .post(`/api/booking/${bookingId}/cancel`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(403);
    });

    it("should reject unauthenticated cancellation", async () => {
      const response = await request(app).post(
        `/api/booking/${bookingId}/cancel`,
      );

      expect(response.statusCode).toBe(401);
    });
  });

  // =========================================================
  // WORKSPACE BOOKINGS
  // =========================================================

  describe("GET /api/booking/workspace", () => {
    it("should allow owner to get workspace bookings", async () => {
      const response = await request(app)
        .get("/api/booking/workspace")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.bookings).toBeDefined();
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    it("should reject customer access", async () => {
      const response = await request(app)
        .get("/api/booking/workspace")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(403);
    });

    it("should reject unauthenticated request", async () => {
      const response = await request(app).get("/api/booking/workspace");

      expect(response.statusCode).toBe(401);
    });
  });

  // =========================================================
  // RESOURCE AVAILABILITY
  // =========================================================

  describe("GET /api/booking/availability", () => {
    it("should return resource availability", async () => {
      const response = await request(app)
        .get("/api/booking/availability")
        .set("Authorization", `Bearer ${customerToken}`)
        .query({
          resource: resourceId,
          startTime: "2026-10-10T10:00:00.000Z",
          endTime: "2026-10-10T12:00:00.000Z",
        });

      expect(response.statusCode).toBe(200);
    });

    it("should allow owner to check availability", async () => {
      const response = await request(app)
        .get("/api/booking/availability")
        .set("Authorization", `Bearer ${ownerToken}`)
        .query({
          resource: resourceId,
          startTime: "2026-10-10T10:00:00.000Z",
          endTime: "2026-10-10T12:00:00.000Z",
        });

      expect(response.statusCode).toBe(200);
    });

    it("should reject unauthenticated availability request", async () => {
      const response = await request(app)
        .get("/api/booking/availability")
        .query({
          resource: resourceId,
          startTime: "2026-10-10T10:00:00.000Z",
          endTime: "2026-10-10T12:00:00.000Z",
        });

      expect(response.statusCode).toBe(401);
    });
  });

  // =========================================================
  // ADMIN BOOKINGS
  // =========================================================

  describe("GET /api/booking", () => {
    it("should reject customer access", async () => {
      const response = await request(app)
        .get("/api/booking")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.statusCode).toBe(403);
    });

    it("should reject owner access", async () => {
      const response = await request(app)
        .get("/api/booking")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.statusCode).toBe(403);
    });

    it("should reject unauthenticated request", async () => {
      const response = await request(app).get("/api/booking");

      expect(response.statusCode).toBe(401);
    });
  });
});
