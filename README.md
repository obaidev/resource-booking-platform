# Smart Resource Booking Platform

**A full-stack booking system for managing workspaces, reservable resources, and time-based reservations.**

A portfolio project focused on building secure REST APIs, role-based access control, booking validation, and reliable backend workflows using Node.js, Express.js, and MongoDB.

[GitHub Repository](https://github.com/obaidev/resource-booking-platform) · [API Documentation](http://localhost:3000/api-docs) *(available when running locally)*

---

## Overview

The Smart Resource Booking Platform provides a centralized way to manage workspaces, resources, and reservations. It supports different user roles, allowing customers to make bookings while workspace owners and administrators manage platform resources and operations.

The project demonstrates full-stack development, REST API design, authentication, authorization, database modeling, and booking-conflict validation.

## Key Features

* **Authentication and Authorization** — JWT-based authentication, password hashing, protected routes, and role-based access control.
* **Workspace Management** — Create, retrieve, update, and delete workspaces through REST APIs.
* **Resource Management** — Manage bookable resources and their associated workspace information.
* **Booking Management** — Create, retrieve, and cancel reservations, with booking history for customers.
* **Booking Conflict Validation** — Validate reservation time ranges and check for overlapping confirmed bookings.
* **Availability Checking** — Retrieve available resources for requested booking periods.
* **Admin Dashboard API** — Provide dashboard statistics through an admin-protected endpoint.
* **API Documentation** — Explore endpoints, request schemas, and authentication through Swagger UI.
* **Automated Testing** — Run the backend test suite to verify application behavior.

## Technology Stack

| Layer               | Technologies                  |
| ------------------- | ----------------------------- |
| Frontend            | React, TypeScript, Vite       |
| Backend             | Node.js, Express.js           |
| Database            | MongoDB, Mongoose             |
| Authentication      | JSON Web Tokens (JWT), bcrypt |
| API Documentation   | Swagger / OpenAPI             |
| Testing and Quality | Automated tests, ESLint       |

## Architecture

The application separates the frontend, backend API, and database responsibilities.

```text
React + TypeScript Frontend
           |
           | HTTP / REST API
           v
Express.js Backend
           |
           +-- Authentication & Authorization
           +-- Workspace Management
           +-- Resource Management
           +-- Booking & Availability
           +-- Admin Dashboard
           |
           v
      MongoDB
```

### Booking Workflow

1. The customer authenticates and submits a booking request.
2. The API validates the requested time range and resource.
3. The backend checks for conflicting confirmed bookings.
4. The booking price is calculated using the resource's hourly rate and booking duration.
5. The booking is saved, and the API returns the result.

The booking flow uses database transactions where configured. Conflict checks and transactions are important parts of the workflow, but they should not be described as a complete concurrency guarantee unless concurrent-booking behavior has been verified under load.

## User Roles

| Role     | Responsibilities                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Customer | Browse resources, check availability, create bookings, view personal bookings, and cancel reservations. |
| Owner    | Manage permitted workspace and resource operations.                                                     |
| Admin    | Access administrator-protected functionality and dashboard statistics.                                  |

Actual permissions depend on the authorization rules implemented by the backend.

## API Overview

Base URL for local development: `http://localhost:3000`

| Method | Endpoint                    | Purpose                             |
| ------ | --------------------------- | ----------------------------------- |
| POST   | `/api/auth/register`        | Register a user                     |
| POST   | `/api/auth/login`           | Authenticate a user                 |
| GET    | `/api/auth/current-user`    | Get the authenticated user          |
| GET    | `/api/workspace`            | Retrieve workspaces                 |
| POST   | `/api/workspace`            | Create a workspace                  |
| GET    | `/api/resource`             | Retrieve resources                  |
| POST   | `/api/resource`             | Create a resource                   |
| POST   | `/api/booking`              | Create a booking                    |
| GET    | `/api/booking/my-bookings`  | Retrieve personal bookings          |
| POST   | `/api/booking/{id}/cancel`  | Cancel a booking                    |
| GET    | `/api/booking/availability` | Check resource availability         |
| GET    | `/api/admin/dashboard`      | Retrieve admin dashboard statistics |

The API also includes additional workspace, resource, and booking operations.

**Interactive API documentation:** Run the backend and visit `http://localhost:3000/api-docs`.

## Getting Started

### Prerequisites

* Node.js and npm
* MongoDB running locally or an accessible MongoDB deployment
* Git

### 1. Clone the repository

```bash
git clone https://github.com/obaidev/resource-booking-platform.git
cd resource-booking-platform
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory using the environment variable names expected by your application. For example:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/resource_booking?replicaSet=rs0
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=7d
```

Use a replica-set-enabled MongoDB deployment if your transaction workflow requires it. Check your project's configuration before copying these example values.

Start the backend using the development script defined in `backend/package.json`, commonly:

```bash
npm run dev
```

### 3. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` if your frontend uses a configurable API URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the frontend using the script defined in `frontend/package.json`, commonly:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

### 4. Explore the API

Once the backend is running:

* API documentation: `http://localhost:3000/api-docs`
* Health check: `http://localhost:3000/health`

Use a valid JWT to test protected endpoints. Administrator endpoints require an account with the admin role.

## Testing and Code Quality

Run the backend tests from the `backend` directory:

```bash
npm test
```

If configured in the project, run lint checks with:

```bash
npm run lint
```

The backend test suite previously reported **92 passing tests**. Re-run the tests before publishing this claim to confirm the current result.

## Engineering Focus

This project explores practical backend and full-stack engineering concepts:

* RESTful API structure and separation of concerns
* Authentication, authorization, and password security
* MongoDB data modeling and Mongoose relationships
* Booking validation and time-range overlap detection
* Transaction-based database workflows
* API documentation and automated testing
* React and TypeScript integration with a backend API

## Future Improvements

* Deploy the frontend and backend to production environments.
* Add CI automation for tests and lint checks.
* Improve observability, structured logging, and production error handling.
* Add broader integration and concurrent-booking tests.

## Author

**Obaid**

Flutter developer expanding into full-stack development with Node.js, Express.js, MongoDB, React, and TypeScript.

[GitHub Profile](https://github.com/obaidev) · [Project Repository](https://github.com/obaidev/resource-booking-platform)
