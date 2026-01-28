# Mini CRM Backend (Prysm Labs Assignment)

Backend for a mini CRM system built for the Prysm Labs Backend Developer Intern assignment. Implements authentication, role-based authorization, and CRUD operations for Users, Customers, and Tasks using Node.js, Express, PostgreSQL, and Prisma ORM.

**Live Deployment:**

- API base URL: https://mini-crm-backend-nyuy.onrender.com
- Swagger UI: https://mini-crm-backend-nyuy.onrender.com/api-docs

---

## Tech Stack

- Node.js (Express)
- PostgreSQL (local or Neon on Render)
- Prisma ORM (v6)
- JWT Authentication (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Input validation (`joi`)
- API Documentation: Swagger (`swagger-ui-express`, `swagger-jsdoc`)
- Logging & security middleware: `morgan`, `helmet`, `cors`
- Testing: Jest + Supertest
- Containerization: Docker + docker-compose

---

## Project Structure

```txt
mini-crm-backend/
├─ prisma/
│  └─ schema.prisma          # Prisma models (User, Customer, Task, enums)
├─ src/
│  ├─ app.js                 # Express app setup (middlewares, Swagger, routes)
│  ├─ server.js              # Server bootstrap (reads PORT from env)
│  ├─ config/
│  │  └─ prisma.js           # PrismaClient instance
│  ├─ controllers/           # HTTP controllers
│  │  ├─ auth.controller.js
│  │  ├─ users.controller.js
│  │  ├─ customers.controller.js
│  │  └─ tasks.controller.js
│  ├─ services/              # Business logic (uses Prisma)
│  │  ├─ auth.service.js
│  │  ├─ users.service.js
│  │  ├─ customers.service.js
│  │  └─ tasks.service.js
│  ├─ middlewares/
│  │  ├─ auth.middleware.js  # JWT verification
│  │  └─ role.middleware.js  # Role-based access control
│  ├─ routes/                # Express routes + Swagger docs
│  │  ├─ auth.routes.js
│  │  ├─ users.routes.js
│  │  ├─ customers.routes.js
│  │  └─ tasks.routes.js
├─ scripts/
│  └─ smoke-test.js          # Simple end-to-end smoke test script
├─ tests/
│  └─ auth.customers.test.js # Jest integration tests
├─ Dockerfile
├─ docker-compose.yml
├─ .env                      # Environment variables (ignored by Git)
├─ .env.example              # Example env variables
├─ package.json
└─ README.md
```

The architecture uses routes → controllers → services → Prisma, with dedicated middlewares for authentication and role checks.

---

## Database Schema (Prisma)

`prisma/schema.prisma` defines 3 core models and enums:

User

Fields: id, name, email (unique), password (hashed), role (ADMIN or EMPLOYEE), createdAt

Relations: tasks (one-to-many)

Customer

Fields: id, name, email (unique), phone (unique), company, createdAt, updatedAt

Relations: tasks (one-to-many)

Task

Fields: id, title, description, status (PENDING, IN_PROGRESS, DONE), assignedTo, customerId, createdAt, updatedAt

Relations:

assignedTo → User (must be EMPLOYEE)

customerId → Customer (cascade on delete)

### Enums

- **Role:** ADMIN, EMPLOYEE
- **TaskStatus:** PENDING, IN_PROGRESS, DONE

---

## Setup Instructions (Local, non-Docker)

### 1. Prerequisites

- Node.js (LTS)
- PostgreSQL running locally (e.g., on `localhost:5432`)

Create a PostgreSQL database:

```sql
CREATE DATABASE crm_db;
```

### 2. Clone and install dependencies

```bash
git clone <your-repo-url>
cd mini-crm-backend
npm install
```

### 3. Environment variables

Create a `.env` file in the project root (based on `.env.example`):

```text
# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/crm_db?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=3000
```

Adjust username/password/host/db name as per your local Postgres.

### 4. Database migration (Prisma)

```bash
npx prisma migrate dev --name init_schema
```

(Optional) inspect data:

```bash
npx prisma studio
```

---

## Running the Server (Local)

### Development

```bash
npm run dev
```

Server: http://localhost:3000

- **Health check:** `GET /` → `{ "message": "Mini CRM Backend is running!" }`
- **Swagger UI:** http://localhost:3000/api-docs

### Production (simple)

```bash
npm start
```

---

## API Documentation (Swagger)

Swagger uses `swagger-jsdoc` and `swagger-ui-express` with annotations in `src/routes/*.js`.

- **Local:** http://localhost:3000/api-docs
- **Render:** https://mini-crm-backend-nyuy.onrender.com/api-docs

Swagger is configured with a relative server URL (/), so it works on both local and Render without CSP issues.

Supports:

Request/response schemas

JWT Bearer auth (button “Authorize” → paste Bearer <token>)

Authentication & Authorization
Roles
ADMIN

EMPLOYEE

JWT
Login returns accessToken (JWT) and user details.

JWT payload includes userId and role.

Protected routes require:

text
Authorization: Bearer <accessToken>
```

### Middlewares

- `auth.middleware.js`: verifies JWT, sets `req.user = { userId, role }`.
- `role.middleware.js`: checks `req.user.role` against allowed roles; returns 403 Forbidden if not allowed.

---

## Core Modules and Endpoints

### 1. Auth Module

Base path: `/auth`

#### POST /auth/register
Registers a new user (ADMIN or EMPLOYEE).

Request:

json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN"
}
Rules:

Email: valid and unique.

Password: minimum 8 characters, stored hashed with bcrypt.

- Response: `id`, `name`, `email`, `role` (no password).

#### POST /auth/login
Logs in a user and returns JWT.

Request:

json
{
  "email": "admin@example.com",
  "password": "password123"
}
Response:

json
{
  "accessToken": "<JWT>",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
**Errors:**
- 401 Unauthorized for invalid email/password.

### 2. Users Module (Admin Only)
Base path: `/users`  
Access: **ADMIN only**

#### GET /users
Returns list of users:

json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN",
    "createdAt": "..."
  }
]
```

#### GET /users/:id

Returns user by id.

- 404 if not found.

#### PATCH /users/:id

Updates role only.

**Request:**

```json
{
  "role": "EMPLOYEE"
}
```

**Rules:**
- Role must be ADMIN or EMPLOYEE.
- 400 for invalid role.
- 404 if user not found.

### 3. Customers Module

Base path: `/customers`

**Access Control:**
- **ADMIN:** full CRUD.
- **EMPLOYEE:** read-only (GET /customers, GET /customers/:id).

#### POST /customers (ADMIN)

Creates a customer.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "company": "Acme Inc"
}
```

**Constraints:**
- `email` unique
- `phone` unique

**Errors:**
- 400 validation errors.
- 409 duplicate email/phone.

#### GET /customers (ADMIN + EMPLOYEE)
Paginated list with optional search.

Query params:

page (default 1)

limit (default 10)

search (optional, filters by name/email/company, case-insensitive)

Response:

json
{
  "page": 1,
  "limit": 10,
  "totalRecords": 2,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9999999999",
      "company": "Acme Inc",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
**Examples:**
- `GET /customers?page=1&limit=10`
- `GET /customers?search=john`

#### GET /customers/:id (ADMIN + EMPLOYEE)
Returns customer by id.

404 if not found.

PATCH /customers/:id (ADMIN)
Partial update of name, email, phone, company.

#### DELETE /customers/:id (ADMIN)

Deletes customer.

- 204 No Content when deleted.
- 404 if not found.

### 4. Tasks Module

Base path: `/tasks`

**Access & Rules:**

ADMIN:

Can create tasks.

Can view all tasks.

Can update status of any task.

EMPLOYEE:

Can view only tasks assigned to them.

Can update status only for their own tasks.

- `assignedTo` must be an existing EMPLOYEE.
- `customerId` must be an existing customer.

#### POST /tasks (ADMIN)
Creates a task.

json
{
  "title": "Call customer",
  "description": "Follow up on proposal",
  "assignedTo": 2,
  "customerId": 1,
  "status": "PENDING"
}
```

- `status` defaults to PENDING if omitted.

**Errors:**
- 404 if assigned user not found or not EMPLOYEE.
- 404 if customer not found.

**Response includes:**
- Task fields.
- `user` (assigned employee metadata: id, name, email).
- `customer` metadata: id, name, email, phone.

#### GET /tasks (ADMIN + EMPLOYEE)

- **ADMIN:** all tasks.
- **EMPLOYEE:** only tasks where `assignedTo` = `req.user.userId`.

Example task object:

```json
{
  "id": 1,
  "title": "Call customer",
  "description": "Follow up",
  "status": "PENDING",
  "assignedTo": 2,
  "customerId": 1,
  "createdAt": "...",
  "updatedAt": "...",
  "user": { "id": 2, "name": "Emp", "email": "emp@example.com" },
  "customer": { "id": 1, "name": "John", "email": "john@example.com", "phone": "9999999999" }
}
```

#### PATCH /tasks/:id/status (ADMIN + EMPLOYEE)

**Request:**

```json
{
  "status": "IN_PROGRESS"
}
```

**Rules:**
- EMPLOYEE can only update tasks assigned to them → 403 Forbidden for others.
- ADMIN can update any task.
- 404 if task not found.

---

## Example curl Commands (Local)

Replace `<ADMIN_TOKEN>` / `<EMP_TOKEN>` with tokens from `/auth/login`.

### Auth

**Register admin:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"password123","role":"ADMIN"}'
```

**Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Users (Admin)

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Customers

**Create:**

```bash
curl -X POST http://localhost:3000/customers \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"9999999999","company":"Acme"}'
```

**List with pagination:**

```bash
curl -X GET "http://localhost:3000/customers?page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Search:**

```bash
curl -X GET "http://localhost:3000/customers?search=john" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Tasks

**Create task:**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Call customer","description":"Follow up","assignedTo":2,"customerId":1,"status":"PENDING"}'
```

**Get tasks:**

```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Update status:**

```bash
curl -X PATCH http://localhost:3000/tasks/1/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'
```

---

## Smoke Test Script

A simple script verifies main flows end-to-end:

```bash
npm run smoke:test
```

It performs:
- Register admin.
- Login admin (get JWT).
- Register employee.
- Create customer.
- Create task assigned to employee.
- List tasks as admin.
- Check console output to confirm all statuses (201/200).

---

## Testing with Jest
Basic integration tests are under tests/ and use Jest + Supertest.

Run:

bash
npm test
Current tests cover:

Auth: register/login flow.

Customers: admin creating a customer and listing/searching.

Docker Support
You can run the app and Postgres with Docker.

docker-compose
docker-compose.yml:

db: Postgres 15, exposed on 5432.

app: Node.js app, uses DATABASE_URL pointing to db.

Run:

bash
docker compose up --build
App: http://localhost:3000
Swagger: http://localhost:3000/api-docs

The Dockerfile runs:

```bash
npx prisma migrate deploy && node src/server.js
```

on container start, so migrations are applied automatically when `DATABASE_URL` is set.

---

## Deployment (Render + Neon PostgreSQL)

The app is deployed on Render using a Neon PostgreSQL database.

- **Live API:** https://mini-crm-backend-nyuy.onrender.com
- **Swagger:** https://mini-crm-backend-nyuy.onrender.com/api-docs

Render setup:

Environment: Docker

Env vars:

DATABASE_URL: Neon connection string (...sslmode=require)

JWT_SECRET: secret value

PORT: provided by Render (app uses process.env.PORT || 3000)

Dockerfile CMD:

npx prisma migrate deploy && node src/server.js

Prisma migrations are automatically applied against Neon on each container start.

Notes
Passwords are never returned in responses.

All protected routes enforce JWT auth and role-based authorization.

Error codes follow assignment guidelines: 400, 401, 403, 404, 409 where appropriate.